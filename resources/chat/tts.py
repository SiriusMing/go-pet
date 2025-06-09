import websocket
import datetime
import hashlib
import base64
import hmac
import json
from urllib.parse import urlencode
import time
import ssl
from wsgiref.handlers import format_date_time
from datetime import datetime
from time import mktime
import _thread as thread
import os


STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识

APPID = '720f4215'
APISECRET = 'MmJlMjM2MWRiOThhOTg1NDZlYzA3YjNm'
APIKEY = '7584231e81bd4c6901d33ba179f12e55'

class Ws_Param(object):
    def __init__(self, APPID, APIKey, APISecret, Text, VCN):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.Text = Text
        self.VCN = VCN

        self.CommonArgs = {"app_id": self.APPID}
        self.BusinessArgs = {"aue": "raw", "auf": "audio/L16;rate=16000", "vcn": self.VCN, "tte": "utf8"}
        self.Data = {"status": 2, "text": str(base64.b64encode(self.Text.encode('utf-8')), "UTF8")}


    # 生成url
    def create_url(self):
        url = 'wss://tts-api.xfyun.cn/v2/tts'
        # 生成RFC1123格式的时间戳
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        # 拼接字符串
        signature_origin = "host: " + "ws-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/tts " + "HTTP/1.1"
        # 进行hmac-sha256进行加密
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        url = url + '?' + urlencode(v)

        return url

def on_message(ws, message):
    try:
        message =json.loads(message)
        code = message["code"]
        sid = message["sid"]
        audio = message["data"]["audio"]
        audio = base64.b64decode(audio)
        status = message["data"]["status"]
        print(message)
        if status == 2:
            print("ws is closed")
            ws.close()
        if code != 0:
            errMsg = message["message"]
            print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))
        else:

            with open('./demo.pcm', 'ab') as f:
                f.write(audio)

    except Exception as e:
        print("receive msg,but parse exception:", e)



# 收到websocket错误的处理
def on_error(ws, error):
    print("### error:", error)


# 收到websocket关闭的处理
def on_close(ws, close_status_code, close_msg):
    print("### closed ###")
    print(f"code: {close_status_code}, msg: {close_msg}")



# 收到websocket连接建立的处理
def on_open1(ws):
    def run1(*args):
        d = {"common": wsParam.CommonArgs,
             "business": wsParam.BusinessArgs,
             "data": wsParam.Data,
             }
        d = json.dumps(d)
        print("------>开始发送文本数据")
        ws.send(d)
        if os.path.exists('./demo.pcm'):
            os.remove('./demo.pcm')

    thread.start_new_thread(run1, ())

def on_open_factory(wsParam):
    def on_open(ws):
        def run(*args):
            d = {
                "common": wsParam.CommonArgs,
                "business": wsParam.BusinessArgs,
                "data": wsParam.Data
            }
            d = json.dumps(d)
            ws.send(d)
            print("------>开始发送文本数据")
        thread.start_new_thread(run, ())
    return on_open


def speak(text, vcn='x4_enus_luna_assist'):
    global wsParam
    if os.path.exists('./demo.pcm'):
        os.remove('./demo.pcm')

    wsParam = Ws_Param(APPID=APPID, APISecret=APISECRET, APIKey=APIKEY, Text=text, VCN=vcn)
    websocket.enableTrace(False)
    wsUrl = wsParam.create_url()
    ws = websocket.WebSocketApp(wsUrl,
                                 on_message=on_message,
                                 on_error=on_error,
                                 on_close=on_close)
    ws.on_open = on_open
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

import wave

def pcm_to_wav(pcm_file, wav_file, channels=1, sample_rate=16000, sample_width=2):
    with open(pcm_file, 'rb') as pcm_f:
        pcm_data = pcm_f.read()

    with wave.open(wav_file, 'wb') as wav_f:
        wav_f.setnchannels(channels)
        wav_f.setsampwidth(sample_width)  # 2 bytes = 16 bits
        wav_f.setframerate(sample_rate)
        wav_f.writeframes(pcm_data)

    print(f"转换完成：{wav_file}")

import simpleaudio as sa

def play_wav(wav_file):
    wave_obj = sa.WaveObject.from_wave_file(wav_file)
    play_obj = wave_obj.play()
    play_obj.wait_done()

def text2audio(text, vcn):
    wsParam = Ws_Param(APPID='720f4215', APISecret='MmJlMjM2MWRiOThhOTg1NDZlYzA3YjNm',
                       APIKey='7584231e81bd4c6901d33ba179f12e55',
                       Text=text, VCN=vcn)

    websocket.enableTrace(False)
    wsUrl = wsParam.create_url()
    ws = websocket.WebSocketApp(wsUrl,
                                 on_message=on_message,
                                 on_error=on_error,
                                 on_close=on_close)
    ws.on_open = on_open_factory(wsParam)  # 传入 wsParam！
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

    pcm_to_wav("demo.pcm", "demo.wav")
    play_wav("demo.wav")

def remove():
    if os.path.exists("demo.wav"):
        os.remove("demo.wav")
    if os.path.exists("demo.pcm"):
        os.remove("demo.pcm")


'''
if __name__ == "__main__":
    # 测试时候在此处正确填写相关信息即可运行
    wsParam = Ws_Param(APPID='720f4215', APISecret='MmJlMjM2MWRiOThhOTg1NDZlYzA3YjNm',
                       APIKey='7584231e81bd4c6901d33ba179f12e55',
                       Text="hello world", VCN='x4_enus_luna_assist')
    websocket.enableTrace(False)
    wsUrl = wsParam.create_url()
    ws = websocket.WebSocketApp(wsUrl, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.on_open = on_open
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
    pcm_to_wav("demo.pcm", "demo.wav")
    play_wav("demo.wav")
'''