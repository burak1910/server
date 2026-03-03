import asyncio
import cv2
import socketio
import av from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack, RTCConfiguration, RTCIceServer

class CameraStream(VideoStreamTrack): def __init__
(self): super().__init__()
self.cap = cv2.VideoCapture(0)

async def recv(self): pts, time_base = await self.next_timestamp()
ret, frame = self.cap.read()
if not ret: return

    frame = cv2.resize(frame, (640, 480))
new_frame = av.VideoFrame.from_ndarray(frame, format = 'bgr24')
new_frame.pts = pts
new_frame.time_base = time_base
return new_frame

async def run():
# 1. Objeleri fonksiyon İÇİNDE oluşturuyoruz(Loop hatasını çözen kısım)
    sio = socketio.AsyncClient()

config = RTCConfiguration(
    iceServers = [RTCIceServer(urls = 'stun:stun.l.google.com:19302')])
pc = RTCPeerConnection(configuration = config)

         @sio.on('message') async def on_message(data): if data['type'] ==
    'answer': await pc.setRemoteDescription(
        RTCSessionDescription(data['sdp'], data['type']))
        print('✅ Telefon bağlandı! Görüntü akıyor...')
            elif data['type'] == 'candidate': cand =
         data['candidate'] if isinstance (cand, dict):
             await pc.addIceCandidate(RTCIceCandidate(
                 candidate = cand['candidate'], sdpMid = cand['sdpMid'],
                 sdpMLineIndex = cand['sdpMLineIndex']))
                 print('📍 Yeni bağlantı yolu eklendi.')

# 2. Render Sunucusuna Bağlan
                     try
    : await sio
  .connect('https://server-ros8.onrender.com', transports = ['websocket'])
  print('🌐 Render sunucusuna başarıyla bağlanıldı!')
  except Exception as e: print(f '❌ Bağlantı hatası: {e}')
  return

# 3. Kamera ve Teklif(Offer) Süreci
      pc.addTrack(CameraStream())

  offer = await pc.createOffer() await pc.setLocalDescription(offer) await sio
              .emit('message', {
                'type': pc.localDescription.type,
                'sdp': pc.localDescription.sdp
              })

                  @pc
              .on('icecandidate') async def on_icecandidate(
                  candidate): if candidate: await sio.emit('message', {
                'type': 'candidate',
                'candidate': {
                  'candidate': candidate.candidate,
                  'sdpMid': candidate.sdpMid,
                  'sdpMLineIndex': candidate.sdpMLineIndex
                }
              })

                  print('🚀 Yayıncı hazır! Flutter uygulamasını bekliyor...')

                      # Kapanmaması için sonsuz döngü try:
    while
      True: await asyncio.sleep(3600)
      except asyncio.CancelledError: await pc.close() await sio.disconnect()

      if __name__ ==
          '__main__': # Windows üzerinde asyncio ve ProactorEventLoop uyumu için
      if hasattr (asyncio, 'set_event_loop_policy'):
          asyncio.set_event_loop_policy(
              asyncio.WindowsSelectorEventLoopPolicy())

asyncio.run(run())