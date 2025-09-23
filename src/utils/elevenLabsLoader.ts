// Utility to manage ElevenLabs Convai widget loading globally
// Prevents multiple script loads and custom element re-registration

let isScriptLoaded = false;
let isCustomElementDefined = false;

export const loadElevenLabsWidget = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if script is already loaded
      if (isScriptLoaded) {
        console.log('ElevenLabs Convai widget already loaded');
        resolve();
        return;
      }

      // Check if custom element is already defined
      if (isCustomElementDefined || customElements.get('elevenlabs-convai')) {
        console.log('ElevenLabs Convai custom element already defined');
        isCustomElementDefined = true;
        resolve();
        return;
      }

      // Check if script element already exists in DOM
      const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        console.log('ElevenLabs Convai script element already exists in DOM');
        isScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onerror = (error) => {
        console.warn('Failed to load ElevenLabs Convai widget:', error);
        reject(error);
      };
      
      script.onload = () => {
        console.log('ElevenLabs Convai widget loaded successfully');
        isScriptLoaded = true;
        isCustomElementDefined = true;
        resolve();
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Error loading ElevenLabs Convai widget:', error);
      reject(error);
    }
  });
};

export const isElevenLabsReady = (): boolean => {
  return isScriptLoaded && (isCustomElementDefined || customElements.get('elevenlabs-convai') !== undefined);
};
