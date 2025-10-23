import React, { useState, useEffect, useRef } from 'react'
import { Mic, Square, Loader, AlertCircle, CheckCircle } from 'lucide-react'

const AudioRecorderComponent = ({ onRecordingComplete, onError, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup al desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      // Solicitar permiso para el micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      streamRef.current = stream
      audioChunksRef.current = []

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
          type: 'audio/webm'
        })

        // Detener el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Limpiar timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        onRecordingComplete?.(audioFile)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error al iniciar grabación:', error)
      
      let errorMessage = 'Error al acceder al micrófono'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permiso de micrófono denegado. Por favor, permite el acceso.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ningún micrófono'
      }
      
      onError?.(errorMessage)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setIsRecording(false)
      setRecordingTime(0)
      audioChunksRef.current = []
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <p className="text-sm text-yellow-700">Tu navegador no soporta grabación de audio</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-2 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
            <Mic className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-900">Grabar Audio</p>
            <p className="text-xs text-gray-500">Describe el movimiento con tu voz</p>
          </div>
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Grabando...</p>
                <p className="text-xs text-red-700">{formatTime(recordingTime)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4" />
              Detener y Procesar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorderComponent
