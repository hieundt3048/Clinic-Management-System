package cms.app.Service;

import java.util.List;

import cms.app.Dto.DoctorDetailResponse;
import cms.app.Dto.UpdateDoctorRequest;

public interface IDoctorService {
    List<DoctorDetailResponse> getAllDoctors();
    
    DoctorDetailResponse getDoctorById(Integer doctorId);

    DoctorDetailResponse updateDoctor(Integer doctorId, UpdateDoctorRequest request);

    void toggleDoctorStatus(Integer doctorId, boolean active);
    
    void deleteDoctor(Integer doctorId);

    DoctorDetailResponse getDoctorByEmail(String email);
}
