import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnnouncerRequestsService } from '@/services/announcer-requests.service';
import { StudentVerificationService } from '@/services/student-verification.service';
import { UploadsService, type PickedFile } from '@/services/uploads.service';
import { useAuthStore } from '@/stores/auth.store';

export function useAnnouncerRequest() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['announcer-request'],
    queryFn: AnnouncerRequestsService.me,
    enabled: !!accessToken,
  });
}

// Uploads the CNI photo, then files the verification request with its media id.
export function useSubmitAnnouncerVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ document, contactPhone }: { document: PickedFile; contactPhone?: string }) => {
      const upload = await UploadsService.upload('id-document', document);
      return AnnouncerRequestsService.create({
        identity_document_media_id: upload.id,
        ...(contactPhone ? { contact_phone: contactPhone } : {}),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcer-request'] }),
  });
}

export function useStudentVerification() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['student-verification'],
    queryFn: StudentVerificationService.me,
    enabled: !!accessToken,
  });
}

// Uploads the student card and the receipt (image or PDF), then files the request.
export function useSubmitStudentVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, receipt }: { studentId: PickedFile; receipt: PickedFile }) => {
      const [studentIdUpload, receiptUpload] = await Promise.all([
        UploadsService.upload('student-id', studentId),
        UploadsService.upload('student-receipt', receipt),
      ]);
      return StudentVerificationService.create({
        student_id_media_id: studentIdUpload.id,
        receipt_media_id: receiptUpload.id,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-verification'] }),
  });
}
