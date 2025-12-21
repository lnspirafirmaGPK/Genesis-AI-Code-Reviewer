export interface Translation {
  title: string;
  poweredBy: string;
  pasteYourCode: string;
  codePlaceholder: string;
  analyzing: string;
  reviewCode: string;
  formatCode: string;
  feedback: string;
  copied: string;
  copy: string;
  loadingTitle: string;
  loadingSubtitle: string;
  waitingForCodeTitle: string;
  waitingForCodeSubtitle: string;
  performanceReport: string;
  executionTime: string;
  memoryUsage: string;
  complexity: string;
  resetSession: string;
  history: string;
  noHistoryYet: string;
  clearHistory: string;
  loadEntry: string;
  reviewedOn: string;
  errors: {
    commonCauses: string;
    whatToDo: string;
    apiKey: {
      title: string;
      message: string;
    };
    network: {
      title: string;
      message: string;
    };
    service: {
      title: string;
      message: string;
    };
    parsing: {
      title: string;
      message: string;
    };
    unknown: {
      title: string;
      message: string;
    };
    causes: {
      apiKey: string;
      network: string;
      service: string;
      parsing: string;
      unknown: string;
    };
    actions: {
      verifyKey: string;
      checkNetwork: string;
      tryAgain: string;
      reportBug: string;
    };
  };
}

export const translations: { en: Translation; th: Translation } = {
  en: {
    title: 'AI Code Reviewer',
    poweredBy: 'Powered by Gemini',
    pasteYourCode: 'Paste Your Code',
    codePlaceholder: 'Enter your code snippet here...',
    analyzing: 'Analyzing...',
    reviewCode: 'Review Code',
    formatCode: 'Format Code',
    feedback: 'Feedback',
    copied: 'Copied!',
    copy: 'Copy',
    loadingTitle: 'Gemini is reviewing your code...',
    loadingSubtitle: 'This may take a moment.',
    waitingForCodeTitle: 'Waiting for code',
    waitingForCodeSubtitle: 'Paste your code in the editor and click "Review Code" to get started.',
    performanceReport: 'Performance Report',
    executionTime: 'Est. Execution Time',
    memoryUsage: 'Est. Memory Usage',
    complexity: 'Complexity Analysis',
    resetSession: 'Reset Session',
    history: 'History',
    noHistoryYet: 'No review history yet.',
    clearHistory: 'Clear History',
    loadEntry: 'Load',
    reviewedOn: 'Reviewed on',
    errors: {
      commonCauses: 'Common Causes',
      whatToDo: 'What you can try',
      apiKey: {
        title: 'API Key Error',
        message: 'There was an issue with your Gemini API Key. Please ensure it is correctly configured and has the necessary permissions.'
      },
      network: {
        title: 'Network Error',
        message: 'Could not connect to the Gemini API due to a network issue. Please check your internet connection.'
      },
      service: {
        title: 'Service Unavailable',
        message: 'The Gemini API service is currently unavailable. This might be a temporary issue on their end.'
      },
      parsing: {
        title: 'Invalid API Response',
        message: 'Received an unreadable or malformed response from the Gemini API. The model might have returned an invalid JSON.'
      },
      unknown: {
        title: 'An Unknown Error Occurred',
        message: 'An unexpected error prevented the code review. Please try again or contact support if the issue persists.'
      },
      causes: {
        apiKey: 'Invalid or missing API Key. Ensure it is set in your environment variables.',
        network: 'Network connectivity issues (e.g., no internet connection, firewall).',
        service: 'The Gemini API service may be temporarily unavailable or experiencing high load.',
        parsing: 'The Gemini API returned data in an unexpected format (not valid JSON as per schema).',
        unknown: 'An unhandled error occurred during the API call or application processing.',
      },
      actions: {
        verifyKey: 'Verify that your API_KEY environment variable is set correctly and has the required permissions.',
        checkNetwork: 'Check your internet connection and proxy settings, then try again.',
        tryAgain: 'Please try again in a few moments. The service might be recovering.',
        reportBug: 'If this issue persists, please report it to the developers with the console error details.',
      },
    },
  },
  th: {
    title: 'เครื่องมือตรวจสอบโค้ด AI',
    poweredBy: 'ขับเคลื่อนโดย Gemini',
    pasteYourCode: 'วางโค้ดของคุณ',
    codePlaceholder: 'ป้อนข้อมูลโค้ดของคุณที่นี่...',
    analyzing: 'กำลังวิเคราะห์...',
    reviewCode: 'ตรวจสอบโค้ด',
    formatCode: 'จัดรูปแบบโค้ด',
    feedback: 'ผลตอบรับ',
    copied: 'คัดลอกแล้ว!',
    copy: 'คัดลอก',
    loadingTitle: 'Gemini กำลังตรวจสอบโค้ดของคุณ...',
    loadingSubtitle: 'อาจใช้เวลาสักครู่',
    waitingForCodeTitle: 'กำลังรอโค้ด',
    waitingForCodeSubtitle: 'วางโค้ดของคุณในเครื่องมือแก้ไขและคลิก "ตรวจสอบโค้ด" เพื่อเริ่มต้น',
    performanceReport: 'รายงานประสิทธิภาพ',
    executionTime: 'เวลาประมวลผลโดยประมาณ',
    memoryUsage: 'การใช้หน่วยความจำโดยประมาณ',
    complexity: 'การวิเคราะห์ความซับซ้อน',
    resetSession: 'เริ่มเซสชันใหม่',
    history: 'ประวัติ',
    noHistoryYet: 'ยังไม่มีประวัติการตรวจสอบ',
    clearHistory: 'ล้างประวัติ',
    loadEntry: 'โหลด',
    reviewedOn: 'ตรวจสอบเมื่อ',
    errors: {
      commonCauses: 'สาเหตุทั่วไป',
      whatToDo: 'สิ่งที่คุณสามารถลองได้',
      apiKey: {
        title: 'ข้อผิดพลาด API Key',
        message: 'มีปัญหาเกี่ยวกับ Gemini API Key ของคุณ โปรดตรวจสอบให้แน่ใจว่าได้กำหนดค่าไว้อย่างถูกต้องและมีสิทธิ์ที่จำเป็น'
      },
      network: {
        title: 'ข้อผิดพลาดเครือข่าย',
        message: 'ไม่สามารถเชื่อมต่อกับ Gemini API เนื่องจากปัญหาเครือข่าย โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ'
      },
      service: {
        title: 'บริการไม่พร้อมใช้งาน',
        message: 'บริการ Gemini API ไม่พร้อมใช้งานในขณะนี้ นี่อาจเป็นปัญหาชั่วคราวจากฝั่งผู้ให้บริการ'
      },
      parsing: {
        title: 'การตอบสนอง API ไม่ถูกต้อง',
        message: 'ได้รับการตอบสนองที่ไม่สามารถอ่านได้หรือมีรูปแบบผิดพลาดจาก Gemini API โมเดลอาจส่งคืน JSON ที่ไม่ถูกต้อง'
      },
      unknown: {
        title: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        message: 'เกิดข้อผิดพลาดที่ไม่คาดคิดซึ่งขัดขวางการตรวจสอบโค้ด โปรดลองอีกครั้งหรือติดต่อฝ่ายสนับสนุนหากปัญหายังคงอยู่'
      },
      causes: {
        apiKey: 'API Key ไม่ถูกต้องหรือขาดหายไป ตรวจสอบให้แน่ใจว่าได้ตั้งค่าในตัวแปรสภาพแวดล้อมของคุณ',
        network: 'ปัญหาการเชื่อมต่อเครือข่าย (เช่น ไม่มีอินเทอร์เน็ต, ไฟร์วอลล์).',
        service: 'บริการ Gemini API อาจไม่พร้อมใช้งานชั่วคราวหรือมีภาระงานสูง',
        parsing: 'Gemini API ส่งคืนข้อมูลในรูปแบบที่ไม่คาดคิด (ไม่ใช่ JSON ที่ถูกต้องตาม Schema).',
        unknown: 'เกิดข้อผิดพลาดที่ไม่สามารถจัดการได้ระหว่างการเรียก API หรือการประมวลผลแอปพลิเคชัน.',
      },
      actions: {
        verifyKey: 'ตรวจสอบว่าตัวแปรสภาพแวดล้อม API_KEY ของคุณถูกตั้งค่าอย่างถูกต้องและมีสิทธิ์ที่จำเป็น',
        checkNetwork: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและการตั้งค่าพร็อกซีของคุณ จากนั้นลองอีกครั้ง',
        tryAgain: 'โปรดลองอีกครั้งในอีกสักครู่ บริการอาจกำลังกู้คืน',
        reportBug: 'หากปัญหานี้ยังคงอยู่ โปรดรายงานให้ผู้พัฒนาทราบพร้อมรายละเอียดข้อผิดพลาดในคอนโซล',
      },
    },
  },
};