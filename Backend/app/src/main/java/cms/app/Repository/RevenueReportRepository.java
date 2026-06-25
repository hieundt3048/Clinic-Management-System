package cms.app.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Invoice;

/**
 * Repository cho báo cáo doanh thu.
 * Tất cả query đều lọc theo Invoice.status = 'PAID' và khoảng thời gian.
 */
@Repository
public interface RevenueReportRepository extends JpaRepository<Invoice, Integer> {

    // ─────────────────────────────────────────
    // Tổng doanh thu và số lượng hóa đơn
    // ─────────────────────────────────────────

    @Query("""
        SELECT COALESCE(SUM(i.totalAmount), 0)
        FROM Invoice i
        WHERE i.status = 'PAID'
          AND i.paidAt >= :from
          AND i.paidAt <= :to
        """)
    BigDecimal sumRevenue(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    @Query("""
        SELECT COUNT(i)
        FROM Invoice i
        WHERE i.status = 'PAID'
          AND i.paidAt >= :from
          AND i.paidAt <= :to
        """)
    int countPaidInvoices(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    @Query("""
        SELECT COUNT(i)
        FROM Invoice i
        WHERE i.status = 'UNPAID'
          AND i.createdAt >= :from
          AND i.createdAt <= :to
        """)
    int countUnpaidInvoices(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    // ─────────────────────────────────────────
    // Doanh thu theo bác sĩ
    // ─────────────────────────────────────────

    @Query("""
        SELECT d.doctorId,
               d.fullName,
               s.specialtyName,
               COALESCE(SUM(i.totalAmount), 0),
               COUNT(i)
        FROM Invoice i
        JOIN i.appointment a
        JOIN a.doctor d
        JOIN d.specialty s
        WHERE i.status = 'PAID'
          AND i.paidAt >= :from
          AND i.paidAt <= :to
        GROUP BY d.doctorId, d.fullName, s.specialtyName
        ORDER BY SUM(i.totalAmount) DESC
        """)
    List<Object[]> revenueByDoctor(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    // ─────────────────────────────────────────
    // Doanh thu theo chuyên khoa
    // ─────────────────────────────────────────

    @Query("""
        SELECT s.specialtyId,
               s.specialtyName,
               COALESCE(SUM(i.totalAmount), 0),
               COUNT(i)
        FROM Invoice i
        JOIN i.appointment a
        JOIN a.doctor d
        JOIN d.specialty s
        WHERE i.status = 'PAID'
          AND i.paidAt >= :from
          AND i.paidAt <= :to
        GROUP BY s.specialtyId, s.specialtyName
        ORDER BY SUM(i.totalAmount) DESC
        """)
    List<Object[]> revenueBySpecialty(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);

    // ─────────────────────────────────────────
    // Doanh thu theo ngày (cho biểu đồ)
    // ─────────────────────────────────────────

    @Query("""
        SELECT CAST(i.paidAt AS date),
               COALESCE(SUM(i.totalAmount), 0),
               COUNT(i)
        FROM Invoice i
        WHERE i.status = 'PAID'
          AND i.paidAt >= :from
          AND i.paidAt <= :to
        GROUP BY CAST(i.paidAt AS date)
        ORDER BY CAST(i.paidAt AS date) ASC
        """)
    List<Object[]> revenueByDate(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to);
}
