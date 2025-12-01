package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.StatistiquesDTO;
import com.monentreprise.gestiondevisfactures.entity.Client;
import com.monentreprise.gestiondevisfactures.entity.Devis;
import com.monentreprise.gestiondevisfactures.entity.Facture;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.repository.ClientRepository;
import com.monentreprise.gestiondevisfactures.repository.DevisRepository;
import com.monentreprise.gestiondevisfactures.repository.FactureRepository;
import com.monentreprise.gestiondevisfactures.repository.ProduitRepository;
import com.monentreprise.gestiondevisfactures.service.StatistiquesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implémentation du service de statistiques
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatistiquesServiceImpl implements StatistiquesService {

    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final DevisRepository devisRepository;
    private final FactureRepository factureRepository;

    @Override
    public StatistiquesDTO getStatistiquesGlobales() {
        StatistiquesDTO stats = new StatistiquesDTO();

        // Statistiques clients
        stats.setNombreClients((int) clientRepository.count());
        stats.setNombreClientsActifs(clientRepository.findByActifTrue().size());

        // Statistiques produits
        stats.setNombreProduits((int) produitRepository.count());
        stats.setNombreProduitsActifs(produitRepository.findByActifTrue().size());

        // Statistiques devis
        List<Devis> tousLesDevis = devisRepository.findAll();
        stats.setNombreDevis(tousLesDevis.size());
        stats.setNombreDevisEnCours((int) tousLesDevis.stream()
                .filter(d -> d.getStatut() == Devis.StatutDevis.EN_COURS).count());
        stats.setNombreDevisValides((int) tousLesDevis.stream()
                .filter(d -> d.getStatut() == Devis.StatutDevis.VALIDE).count());
        stats.setNombreDevisTransformes((int) tousLesDevis.stream()
                .filter(d -> d.getStatut() == Devis.StatutDevis.TRANSFORME_EN_FACTURE).count());

        // Statistiques factures
        List<Facture> toutesLesFactures = factureRepository.findAll();
        stats.setNombreFactures(toutesLesFactures.size());
        stats.setNombreFacturesPayees((int) toutesLesFactures.stream()
                .filter(f -> f.getStatut() == Facture.StatutFacture.PAYEE).count());
        stats.setNombreFacturesNonPayees((int) toutesLesFactures.stream()
                .filter(f -> f.getStatut() == Facture.StatutFacture.NON_PAYEE).count());

        // Chiffre d'affaires
        stats.setChiffreAffaireTotal(factureRepository.calculateTotalCA());

        // CA du mois en cours
        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finMois = debutMois.plusMonths(1).minusSeconds(1);
        stats.setChiffreAffaireMois(factureRepository.calculateCAByPeriode(debutMois, finMois));

        // CA de l'année en cours
        LocalDateTime debutAnnee = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finAnnee = debutAnnee.plusYears(1).minusSeconds(1);
        stats.setChiffreAffaireAnnee(factureRepository.calculateCAByPeriode(debutAnnee, finAnnee));

        return stats;
    }

    @Override
    public StatistiquesDTO getChiffreAffaires() {
        StatistiquesDTO stats = new StatistiquesDTO();
        
        stats.setChiffreAffaireTotal(factureRepository.calculateTotalCA());

        // CA du mois en cours
        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finMois = debutMois.plusMonths(1).minusSeconds(1);
        stats.setChiffreAffaireMois(factureRepository.calculateCAByPeriode(debutMois, finMois));

        // CA de l'année en cours
        LocalDateTime debutAnnee = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finAnnee = debutAnnee.plusYears(1).minusSeconds(1);
        stats.setChiffreAffaireAnnee(factureRepository.calculateCAByPeriode(debutAnnee, finAnnee));

        return stats;
    }

    @Override
    public StatistiquesDTO getCAParMois(int annee) {
        StatistiquesDTO stats = new StatistiquesDTO();
        
        Map<Integer, BigDecimal> caParMois = new HashMap<>();
        // Initialiser tous les mois à 0
        for (int i = 1; i <= 12; i++) {
            caParMois.put(i, BigDecimal.ZERO);
        }

        // Remplir avec les données réelles
        List<Object[]> results = factureRepository.calculateCAByMois(annee);
        for (Object[] result : results) {
            Integer mois = (Integer) result[0];
            BigDecimal ca = (BigDecimal) result[1];
            caParMois.put(mois, ca);
        }

        stats.setCaParMois(caParMois);
        return stats;
    }

    @Override
    public StatistiquesDTO getStatistiquesClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", clientId));

        StatistiquesDTO stats = new StatistiquesDTO();
        stats.setClientId(clientId);
        stats.setClientNom(client.getNom());

        // Nombre de devis
        List<Devis> devisClient = devisRepository.findByClientId(clientId);
        stats.setNombreDevisClient(devisClient.size());

        // Nombre de factures
        List<Facture> facturesClient = factureRepository.findByClientId(clientId);
        stats.setNombreFacturesClient(facturesClient.size());

        // CA du client
        stats.setCaClient(factureRepository.calculateCAByClient(clientId));

        return stats;
    }
}
