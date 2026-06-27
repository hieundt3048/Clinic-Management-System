package cms.app.Service;

import java.util.List;

import cms.app.Repository.CreateMedicalRecordRequest;
import cms.app.Repository.MedicalRecordResponse;
import cms.app.Repository.UpdateMedicalRecordRequest;

public interface IMedicalRecordService {
    MedicalRecordResponse createRecord(CreateMedicalRecordRequest request);

    MedicalRecordResponse updateRecord(Integer recordId, Integer doctorId, UpdateMedicalRecordRequest request);

    List<MedicalRecordResponse> getByDoctor(Integer doctorId);
    
    List<MedicalRecordResponse> getByPatient(Integer patientId);
}
