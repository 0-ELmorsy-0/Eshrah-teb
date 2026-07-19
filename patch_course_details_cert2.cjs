const fs = require('fs');
let code = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

if (!code.includes('<CertificatePreviewModal')) {
  // Inject before the last </div>
  const parts = code.split(/<\/\s*div\s*>\s*;\s*\}\s*$/);
  if (parts.length > 1) {
    code = parts[0] + 
`  <CertificatePreviewModal 
        isOpen={showCertModal} 
        onClose={() => setShowCertModal(false)} 
        studentName={certStudentName} 
        gender={certGender} 
        courseTitle={course?.title || ''} 
      />
    </div>
  );
}`;
    console.log("Injected Modal Component");
  } else {
    // try replacing the last </div>
    const lastDivIndex = code.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
      code = code.substring(0, lastDivIndex) + 
`  <CertificatePreviewModal 
        isOpen={showCertModal} 
        onClose={() => setShowCertModal(false)} 
        studentName={certStudentName} 
        gender={certGender} 
        courseTitle={course?.title || ''} 
      />
    </div>` + code.substring(lastDivIndex + 6);
      console.log("Injected Modal Component");
    }
  }
}

fs.writeFileSync('src/pages/CourseDetails.tsx', code);
