package ro.upt.pontaje.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ro.upt.pontaje.model.Timesheet;
import ro.upt.pontaje.model.TimesheetStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pentru operații CRUD pe entitatea Timesheet
 */
@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, UUID> {

    /**
     * Găsește toate pontajele pentru un utilizator
     */
    List<Timesheet> findByUserIdOrderByYearDescMonthDesc(UUID userId);

    /**
     * Găsește pontajul pentru un utilizator, lună și an specific
     */
    Optional<Timesheet> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);

    /**
     * Verifică dacă există pontaj pentru utilizator, lună și an
     */
    boolean existsByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);

    /**
     * Găsește toate pontajele după status
     */
    List<Timesheet> findByStatus(TimesheetStatus status);

    /**
     * Găsește toate pontajele pentru o lună și an
     */
    List<Timesheet> findByMonthAndYearOrderByUserLastNameAsc(Integer month, Integer year);

    /**
     * Găsește pontajele trimise pentru o lună și an
     */
    List<Timesheet> findByMonthAndYearAndStatusOrderByUserLastNameAsc(
        Integer month, Integer year, TimesheetStatus status);

    /**
     * Găsește pontajele dintr-un departament pentru o lună și an
     */
    @Query("SELECT t FROM Timesheet t WHERE t.user.department.id = :departmentId " +
           "AND t.month = :month AND t.year = :year ORDER BY t.user.lastName ASC")
    List<Timesheet> findByDepartmentAndPeriod(
        @Param("departmentId") UUID departmentId,
        @Param("month") Integer month,
        @Param("year") Integer year);

    /**
     * Găsește utilizatorii care nu au trimis pontajul pentru o perioadă
     */
    @Query("SELECT u.id FROM User u WHERE u.role = 'CADRU_DIDACTIC' AND u.status = 'ACTIVE' " +
           "AND u.id NOT IN (SELECT t.user.id FROM Timesheet t WHERE t.month = :month AND t.year = :year " +
           "AND t.status IN ('SUBMITTED', 'APPROVED'))")
    List<UUID> findUsersWithoutSubmittedTimesheet(
        @Param("month") Integer month, 
        @Param("year") Integer year);

    /**
     * Statistici pontaje pe status pentru o perioadă
     */
    @Query("SELECT t.status, COUNT(t) FROM Timesheet t WHERE t.month = :month AND t.year = :year GROUP BY t.status")
    List<Object[]> getStatusStatistics(@Param("month") Integer month, @Param("year") Integer year);

    /**
     * Numără pontajele trimise pentru o lună și an
     */
    long countByMonthAndYearAndStatus(Integer month, Integer year, TimesheetStatus status);
}
