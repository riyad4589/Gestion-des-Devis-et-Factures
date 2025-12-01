package com.monentreprise.gestiondevisfactures.service.impl;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.monentreprise.gestiondevisfactures.entity.Devis;
import com.monentreprise.gestiondevisfactures.entity.DevisDetail;
import com.monentreprise.gestiondevisfactures.entity.Facture;
import com.monentreprise.gestiondevisfactures.entity.FactureDetail;
import com.monentreprise.gestiondevisfactures.exception.BusinessException;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.repository.DevisRepository;
import com.monentreprise.gestiondevisfactures.repository.FactureRepository;
import com.monentreprise.gestiondevisfactures.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * Implémentation du service de génération PDF
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PdfServiceImpl implements PdfService {

    private final DevisRepository devisRepository;
    private final FactureRepository factureRepository;

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(41, 128, 185);
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(52, 73, 94);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public byte[] genererPdfDevis(Long devisId) {
        Devis devis = devisRepository.findByIdWithLignes(devisId)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", devisId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            // En-tête entreprise
            addEntrepriseHeader(document, "DEVIS");

            // Informations du devis
            addDocumentInfo(document, "Devis N°", devis.getNumeroDevis(), 
                    devis.getDateDevis().format(DATE_FORMATTER));

            // Informations client
            addClientInfo(document, devis.getClient().getNom(), 
                    devis.getClient().getEmail(),
                    devis.getClient().getTelephone(),
                    devis.getClient().getAdresse());

            // Tableau des lignes
            Table table = createLignesTable();
            for (DevisDetail ligne : devis.getLignes()) {
                addLigneToTable(table, 
                        ligne.getProduit().getNom(),
                        ligne.getQuantite(),
                        ligne.getPrixUnitaireHT(),
                        ligne.getTva(),
                        ligne.getTotalLigneHT(),
                        ligne.getTotalLigneTTC());
            }
            document.add(table);

            // Totaux
            addTotaux(document, devis.getTotalHT(), devis.getTotalTVA(), devis.getTotalTTC());

            // Commentaire
            if (devis.getCommentaire() != null && !devis.getCommentaire().isEmpty()) {
                document.add(new Paragraph("\nCommentaire: " + devis.getCommentaire())
                        .setFontSize(10));
            }

            // Conditions générales
            addConditionsGenerales(document, true);

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de la génération du PDF: " + e.getMessage());
        }
    }

    @Override
    public byte[] genererPdfFacture(Long factureId) {
        Facture facture = factureRepository.findByIdWithLignes(factureId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", factureId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            // En-tête entreprise
            addEntrepriseHeader(document, "FACTURE");

            // Informations de la facture
            addDocumentInfo(document, "Facture N°", facture.getNumeroFacture(),
                    facture.getDateFacture().format(DATE_FORMATTER));

            // Informations client
            addClientInfo(document, facture.getClient().getNom(),
                    facture.getClient().getEmail(),
                    facture.getClient().getTelephone(),
                    facture.getClient().getAdresse());

            // Référence devis si applicable
            if (facture.getDevisOrigine() != null) {
                document.add(new Paragraph("Référence devis: " + facture.getDevisOrigine().getNumeroDevis())
                        .setFontSize(10)
                        .setMarginBottom(10));
            }

            // Tableau des lignes
            Table table = createLignesTable();
            for (FactureDetail ligne : facture.getLignes()) {
                addLigneToTable(table,
                        ligne.getProduit().getNom(),
                        ligne.getQuantite(),
                        ligne.getPrixUnitaireHT(),
                        ligne.getTva(),
                        ligne.getTotalLigneHT(),
                        ligne.getTotalLigneTTC());
            }
            document.add(table);

            // Totaux
            addTotaux(document, facture.getMontantHT(), facture.getMontantTVA(), facture.getMontantTTC());

            // Statut et mode de paiement
            String statutText = "Statut: " + formatStatut(facture.getStatut());
            if (facture.getModePaiement() != null) {
                statutText += " | Mode de paiement: " + facture.getModePaiement().name();
            }
            document.add(new Paragraph(statutText)
                    .setFontSize(10)
                    .setMarginTop(10));

            // Conditions générales
            addConditionsGenerales(document, false);

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de la génération du PDF: " + e.getMessage());
        }
    }

    private void addEntrepriseHeader(Document document, String documentType) {
        // Nom de l'entreprise
        document.add(new Paragraph("MON ENTREPRISE")
                .setFontSize(24)
                .setBold()
                .setFontColor(PRIMARY_COLOR));

        // Coordonnées
        document.add(new Paragraph("123 Rue de l'Exemple\n75001 Paris\nTél: 01 23 45 67 89\nEmail: contact@monentreprise.com\nSIRET: 123 456 789 00012")
                .setFontSize(10)
                .setMarginBottom(20));

        // Type de document
        document.add(new Paragraph(documentType)
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(HEADER_COLOR)
                .setMarginBottom(20));
    }

    private void addDocumentInfo(Document document, String label, String numero, String date) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        infoTable.addCell(createInfoCell(label + " " + numero));
        infoTable.addCell(createInfoCell("Date: " + date).setTextAlignment(TextAlignment.RIGHT));

        document.add(infoTable);
    }

    private void addClientInfo(Document document, String nom, String email, String telephone, String adresse) {
        document.add(new Paragraph("Client:")
                .setBold()
                .setFontSize(12));

        StringBuilder clientInfo = new StringBuilder();
        clientInfo.append(nom);
        if (email != null) clientInfo.append("\n").append(email);
        if (telephone != null) clientInfo.append("\n").append(telephone);
        if (adresse != null) clientInfo.append("\n").append(adresse);

        document.add(new Paragraph(clientInfo.toString())
                .setFontSize(10)
                .setMarginBottom(20));
    }

    private Table createLignesTable() {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 10, 15, 10, 12, 13}))
                .useAllAvailableWidth()
                .setMarginTop(10);

        // En-têtes
        String[] headers = {"Produit", "Qté", "Prix HT", "TVA", "Total HT", "Total TTC"};
        for (String header : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(header).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(HEADER_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(5);
            table.addHeaderCell(cell);
        }

        return table;
    }

    private void addLigneToTable(Table table, String produit, int quantite, 
            java.math.BigDecimal prixHT, java.math.BigDecimal tva,
            java.math.BigDecimal totalHT, java.math.BigDecimal totalTTC) {
        
        table.addCell(createTableCell(produit, TextAlignment.LEFT));
        table.addCell(createTableCell(String.valueOf(quantite), TextAlignment.CENTER));
        table.addCell(createTableCell(String.format("%.2f €", prixHT), TextAlignment.RIGHT));
        table.addCell(createTableCell(String.format("%.0f%%", tva), TextAlignment.CENTER));
        table.addCell(createTableCell(String.format("%.2f €", totalHT), TextAlignment.RIGHT));
        table.addCell(createTableCell(String.format("%.2f €", totalTTC), TextAlignment.RIGHT));
    }

    private void addTotaux(Document document, java.math.BigDecimal totalHT, 
            java.math.BigDecimal totalTVA, java.math.BigDecimal totalTTC) {
        
        Table totauxTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .useAllAvailableWidth()
                .setMarginTop(20);

        totauxTable.addCell(createTotauxCell("Total HT:", false));
        totauxTable.addCell(createTotauxCell(String.format("%.2f €", totalHT), false));
        
        totauxTable.addCell(createTotauxCell("Total TVA:", false));
        totauxTable.addCell(createTotauxCell(String.format("%.2f €", totalTVA), false));
        
        totauxTable.addCell(createTotauxCell("Total TTC:", true));
        totauxTable.addCell(createTotauxCell(String.format("%.2f €", totalTTC), true));

        document.add(totauxTable);
    }

    private void addConditionsGenerales(Document document, boolean isDevis) {
        document.add(new Paragraph("\n\nConditions générales:")
                .setBold()
                .setFontSize(10)
                .setMarginTop(30));

        String conditions;
        if (isDevis) {
            conditions = "- Ce devis est valable 30 jours à compter de sa date d'émission.\n" +
                    "- Toute commande implique l'acceptation des présentes conditions.\n" +
                    "- Délai de livraison: à convenir lors de la commande.";
        } else {
            conditions = "- Paiement à réception de facture, sauf accord préalable.\n" +
                    "- En cas de retard de paiement, des pénalités seront appliquées.\n" +
                    "- TVA non applicable, art. 293 B du CGI (si applicable).";
        }

        document.add(new Paragraph(conditions)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY));
    }

    private Cell createInfoCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(11))
                .setBorder(Border.NO_BORDER);
    }

    private Cell createTableCell(String text, TextAlignment alignment) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(9))
                .setTextAlignment(alignment)
                .setPadding(5)
                .setBorderBottom(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
    }

    private Cell createTotauxCell(String text, boolean isBold) {
        Paragraph p = new Paragraph(text).setFontSize(11);
        if (isBold) {
            p.setBold();
        }
        return new Cell()
                .add(p)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(Border.NO_BORDER);
    }

    private String formatStatut(Facture.StatutFacture statut) {
        return switch (statut) {
            case NON_PAYEE -> "Non payée";
            case PARTIELLEMENT_PAYEE -> "Partiellement payée";
            case PAYEE -> "Payée";
            case ANNULEE -> "Annulée";
        };
    }
}
