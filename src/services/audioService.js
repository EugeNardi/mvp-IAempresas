/**
 * Servicio de grabación y procesamiento de audio
 * Utiliza la API de MediaRecorder para grabar audio del navegador
 */

class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
    this.isRecording = false
  }

  /**
   * Inicia la grabación de audio
   */
  async startRecording() {
    try {
      // Solicitar permiso para acceder al micrófono
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      // Configurar MediaRecorder
      const options = { mimeType: 'audio/webm' }
      this.mediaRecorder = new MediaRecorder(this.stream, options)
      this.audioChunks = []

      // Evento cuando hay datos disponibles
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // Iniciar grabación
      this.mediaRecorder.start()
      this.isRecording = true

      return { success: true, message: 'Grabación iniciada' }
    } catch (error) {
      console.error('Error al iniciar grabación:', error)
      
      if (error.name === 'NotAllowedError') {
        return { 
          success: false, 
          message: 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.' 
        }
      }
      
      return { 
        success: false, 
        message: 'Error al acceder al micrófono: ' + error.message 
      }
    }
  }

  /**
   * Detiene la grabación y retorna el archivo de audio
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No hay grabación en curso'))
        return
      }

      this.mediaRecorder.onstop = () => {
        // Crear blob de audio
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        
        // Crear archivo
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
          type: 'audio/webm'
        })

        // Detener el stream
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
        }

        this.isRecording = false
        this.audioChunks = []

        resolve({
          success: true,
          file: audioFile,
          blob: audioBlob,
          size: audioFile.size,
          duration: this.mediaRecorder.recordingDuration || 0
        })
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Cancela la grabación sin guardar
   */
  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }

      this.isRecording = false
      this.audioChunks = []
    }
  }

  /**
   * Verifica si el navegador soporta grabación de audio
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
}

export default AudioRecorder
