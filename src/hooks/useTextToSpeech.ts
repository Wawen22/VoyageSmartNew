
import { useState, useCallback, useEffect } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    // Strip markdown chars for better reading (basic)
    const cleanText = text
      .replace(/\[\[.*?\]\]/g, '') // Remove widget tags
      .replace(/\*\*/g, '') // Remove bold
      .replace(/__/g, '') // Remove italics
      .replace(/#/g, ''); // Remove headers characters

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "it-IT";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported
  };
}
