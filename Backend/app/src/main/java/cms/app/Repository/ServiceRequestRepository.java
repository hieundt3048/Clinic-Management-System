package cms.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.ServiceRequest;
import cms.app.Entity.ServiceRequest.RequestStatus;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Integer> {

    /** Load đầy đủ join để tránh N+1 */
    @Query("""
        SELECT r FROM ServiceRequest r
        JOIN FETCH r.medicalRecord mr
        JOIN FETCH mr.patient p
        JOIN FETCH r.doctor d
        JOIN FETCH r.serviceCatalog s
        WHERE r.requestId = :id
        """)
    Optional<ServiceRequest> findByIdWithDetails(@Param("id") Integer id);

    /** Tất cả chỉ định theo bệnh án */
    @Query("""
        SELECT r FROM ServiceRequest r
        JOIN FETCH r.medicalRecord mr
        JOIN FETCH mr.patient p
        JOIN FETCH r.doctor d
        JOIN FETCH r.serviceCatalog s
        WHERE mr.recordId = :recordId
        ORDER BY r.createdAt DESC
        """)
    List<ServiceRequest> findByRecordId(@Param("recordId") Integer recordId);

    /** Tất cả chỉ định của bệnh nhân (toàn bộ lịch sử) */
    @Query("""
        SELECT r FROM ServiceRequest r
        JOIN FETCH r.medicalRecord mr
        JOIN FETCH mr.patient p
        JOIN FETCH r.doctor d
        JOIN FETCH r.serviceCatalog s
        WHERE p.patientId = :patientId
        ORDER BY r.createdAt DESC
        """)
    List<ServiceRequest> findByPatientId(@Param("patientId") Integer patientId);

    /** Lọc theo trạng thái — dùng cho dashboard nhân viên */
    @Query("""
        SELECT r FROM ServiceRequest r
        JOIN FETCH r.medicalRecord mr
        JOIN FETCH mr.patient p
        JOIN FETCH r.doctor d
        JOIN FETCH r.serviceCatalog s
        WHERE r.status = :status
        ORDER BY r.createdAt ASC
        """)
    List<ServiceRequest> findByStatus(@Param("status") RequestStatus status);
}
