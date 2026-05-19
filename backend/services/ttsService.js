const sdk = require("microsoft-cognitiveservices-speech-sdk");

/**
 * Generates an MP3 audio file using Azure Speech Services SDK configuration
 * @param {string} text - Clean copy text string to process
 * @param {string} voice - Unique Azure voice identifier token string
 * @param {string} filePath - Local target output storage tracking route path
 * @returns {Promise<void>}
 */
function synthesizeTextToFile(text, voice, filePath) {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION,
    );

    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    speechConfig.speechSynthesisVoiceName = voice;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(result);
        } else {
          reject(
            new Error(
              `Azure Synthesis Failed/Cancelled: ${result.errorDetails}`,
            ),
          );
        }
      },
      (err) => {
        synthesizer.close();
        reject(err);
      },
    );
  });
}

module.exports = { synthesizeTextToFile };
