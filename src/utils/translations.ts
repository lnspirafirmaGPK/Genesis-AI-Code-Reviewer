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
  errors: {
    title: string;
    message: string;
    commonCauses: string;
    whatToDo: string;
    causes: {
      apiKey: string;
      network: string;
      service: string;
    };
    actions: {
      verifyKey: string;
      checkNetwork: string;
      tryAgain: string;
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
    errors: {
      title: 'Review Failed',
      message: 'An unexpected error occurred while trying to get feedback from the Gemini API.',
      commonCauses: 'Common Causes',
      whatToDo: 'What you can try',
      causes: {
        apiKey: 'Invalid or missing API Key.',
        network: 'Network connectivity issues.',
        service: 'The Gemini API service may be temporarily unavailable.',
      },
      actions: {
        verifyKey: 'Verify that your API_KEY is set correctly.',
        checkNetwork: 'Check your internet connection.',
        tryAgain: 'Please try again in a few moments.',
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
    errors: {
      title: 'การตรวจสอบล้มเหลว',
      message: 'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะพยายามรับผลตอบรับจาก Gemini API',
      commonCauses: 'สาเหตุทั่วไป',
      whatToDo: 'สิ่งที่คุณสามารถลองได้',
      causes: {
        apiKey: 'API Key ไม่ถูกต้องหรือขาดหายไป',
        network: 'ปัญหาการเชื่อมต่อเครือข่าย',
        service: 'บริการ Gemini API อาจไม่พร้อมใช้งานชั่วคราว',
      },
      actions: {
        verifyKey: 'ตรวจสอบว่า API_KEY ของคุณถูกตั้งค่าอย่างถูกต้อง',
        checkNetwork: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ',
        tryAgain: 'โปรดลองอีกครั้งในอีกสักครู่',
      },
    },
  },
};