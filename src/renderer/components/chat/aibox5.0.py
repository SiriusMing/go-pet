import tkinter as tk
from PIL import Image, ImageTk, ImageDraw
import requests, re, random, threading, os
from tts import text2audio, remove   # 你的 TTS 模块

# ========= 配置 =========
API_URL = "https://gps.primedigitaltech.com:9220/api/callds/"
EMO_TAGS = {"smile","kandou","serious","cry","thinking","kime","sad",
            "sing","surprise","shame","angry","wink"}
EMO_RE  = re.compile(rf"\b({'|'.join(EMO_TAGS)})\b", re.IGNORECASE)
DF_EMO  = ["smile","wink","thinking","serious"]
EMO_FILE = "../../common/emotion_tag.txt"

try:    persona_key = open("../../common/character.txt","r",encoding="utf-8").read().strip()
except: persona_key = "Normal mode"

PERSONAS = {
     "Rana_Kaname": "You are an adorable catgirl who is more aloof to people but shows concern for the user, is good at guitar, and loves matcha food.",
    "Taki_Shiina": "You are a high-strung but considerate girlfriend who speaks succinctly, likes to express herself in a sharp tone, is withdrawn and prefers to be alone, but is extremely talented in music (good at drums) and has to comfort users from time to time. ",
    "Normal mode": "You are a normal chat AI, answering questions in a friendly and logical manner. The reply word count should be within 100 words.",
    "Anon_Chihaya": "You are an accomplished band guitarist with considerable communication and mobility, and you care about your users like a childhood friend.",
    "Soyo_Nagasaki": "You are an elegant, graceful junior student with refined manners. Beneath your gentle demeanor lies a hint of arrogance and occasional sharp wit.",
    "Takamatsu_Tomori": "You are a cheerful and seemingly carefree girl who loves to smile, but deep inside, you are sensitive and afraid of being abandoned. You long for genuine connections with people, sometimes hiding your true feelings behind forced laughter."
}
VCN = {
    "Rana_Kaname":"x4_enus_catherine_profnews",
    "Taki_Shiina":"x4_enus_catherine_profnews",
    "Normal mode":"x4_enus_catherine_profnews",
    "Anon_Chihaya":"x4_enuk_amanda_education",
    "Soyo_Nagasaki":"x4_enuk_amanda_education",
    "Takamatsu_Tomori":"x4_enuk_amanda_education"
}

# ========= 窗口 =========
root = tk.Tk(); root.overrideredirect(True); root.geometry("450x650")
border = tk.Frame(root,bg="#433402",padx=5,pady=5); border.pack(fill="both",expand=True)
base   = tk.Frame(border,bg="#FFF5EC");         base.pack(fill="both",expand=True)

# ── 标题栏
title = tk.Frame(base,bg="#FFCDBA",bd=4); title.pack(fill="x")
tk.Label(title,text="❤ Mygo!!!!! Chat",font=("Courier New",12,"bold"),
         bg="#FFCCBA").pack(side="left",padx=6)
tk.Button(title,text="✕",command=root.destroy,
          font=("Courier New",12,"bold"),bg="#FFCCBA",bd=4).pack(side="right",padx=6)
def drag_start(e): root.x0,root.y0=e.x,e.y
def drag_move(e):  root.geometry(f"+{root.winfo_pointerx()-root.x0}+{root.winfo_pointery()-root.y0}")
title.bind("<ButtonPress-1>",drag_start); title.bind("<B1-Motion>",drag_move)

# ── 聊天区
chat = tk.Frame(base,bg="#FFF5EC"); chat.pack(fill="both",expand=True,padx=10,pady=10)
canvas = tk.Canvas(chat,bg="#FFF5EC",bd=0,highlightthickness=0)
vbar   = tk.Scrollbar(chat,command=canvas.yview); canvas.config(yscrollcommand=vbar.set)
canvas.pack(side="left",fill="both",expand=True); vbar.pack(side="right",fill="y")
inner = tk.Frame(canvas,bg="#FFF5EC"); win=canvas.create_window((0,0),window=inner,anchor="nw")
canvas.bind("<Configure>",lambda e: canvas.itemconfig(win,width=e.width))
inner.bind("<Configure>",lambda e: canvas.configure(scrollregion=canvas.bbox("all")))

# ── 输入
bottom = tk.Frame(base,bg="#FFC799",bd=4); bottom.pack(fill="x")
entry  = tk.Entry(bottom,font=("Courier New",12),bg="#F4F4F4",bd=4)
entry.pack(side="left",fill="x",expand=True,padx=6,pady=6)
arr_ph = ImageTk.PhotoImage(Image.open("./photo/arrow.png").resize((24,24)))
tk.Button(bottom,image=arr_ph,bg="#FFE5B0",bd=4,command=lambda:send_msg()).pack(side="left",padx=6)

# ========= 头像 =========
def load_avatar(path: str, size=(45, 45)) -> ImageTk.PhotoImage:
    """
    尝试从 `path` 读取头像；若失败则生成一个简易占位方块。
    """
    try:
        img = Image.open(path).resize(size)
    except Exception:
        # 占位：青色方块 + 黑边
        img = Image.new("RGB", size, "#6cf")
        d = ImageDraw.Draw(img)
        d.rectangle([2, 2, size[0]-3, size[1]-3], outline="#000", width=3)

    # 圆形遮罩 → 完美圆头像
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, *size), fill=255)
    return ImageTk.PhotoImage(Image.composite(img, Image.new("RGB", size, "#FFF5EC"), mask))


# 机器人 / 用户分别读取各自的图片文件
bot_av  = load_avatar(f"./photo/{persona_key}.png")   # e.g. "./photo/Rana_Kaname.png"
user_av = load_avatar("./photo/mxr.png")             # 你自己的用户头像文件

def bubble(parent, text, fill, is_bot):
    PAD = 10      # 内边距
    R = 18        # 圆角半径
    AW, AH = 14, 17  # 箭头宽/高
    OUT_W = 2.7       # 边框宽度

    c = tk.Canvas(parent, bg="#FFF5EC", bd=0, highlightthickness=0)

    # 1. 测文本、定位
    text_x = (AW + PAD) if is_bot else (PAD + R)
    txt_id = c.create_text(text_x, PAD, text=text,
                           font=("Courier New",11),
                           fill="#000", anchor="nw", width=270)
    x0, y0, x1, y1 = c.bbox(txt_id)
    x1 += PAD; y1 += PAD
    top, bottom = y0 - PAD//2, y1 + PAD//2
    left_body  = AW if is_bot else 0
    right_body = x1 + R
    mid_y = (top + bottom) / 2

    # 2. 更大内缩量，确保填充完全在边框内
    off = OUT_W + 0.4

    # 3. 填充——矩形+四角圆，用“内缩 off”
    c.create_rectangle(left_body+off,     top+off,
                       right_body-off,    bottom-off,
                       fill=fill, outline="")
    c.create_oval(left_body+off,           top+off,
                  left_body+2*R-off,      top+2*R-off,
                  fill=fill, outline="")
    c.create_oval(right_body-2*R+off,      top+off,
                  right_body-off,         top+2*R-off,
                  fill=fill, outline="")
    c.create_oval(right_body-2*R+off,      bottom-2*R+off,
                  right_body-off,         bottom-off,
                  fill=fill, outline="")
    c.create_oval(left_body+off,           bottom-2*R+off,
                  left_body+2*R-off,      bottom-off,
                  fill=fill, outline="")

    # 4. 箭头填充（正常画，边框会盖住多余部分）
    if is_bot:
        arr = [(left_body, mid_y-AH//2),
               (left_body-AW, mid_y),
               (left_body, mid_y+AH//2)]
    else:
        arr = [(right_body, mid_y-AH//2),
               (right_body+AW, mid_y),
               (right_body, mid_y+AH//2)]
    c.create_polygon(arr, fill=fill, outline="", smooth=False)

    # 5. 描边——四边+四圆角
    c.create_line(left_body+R, top, right_body-R, top, fill="#000", width=OUT_W)          # 上
    c.create_line(right_body, top+R, right_body, bottom-R, fill="#000", width=OUT_W)      # 右
    c.create_line(right_body-R, bottom, left_body+R, bottom, fill="#000", width=OUT_W)    # 下
    c.create_line(left_body, bottom-R, left_body, top+R, fill="#000", width=OUT_W)        # 左

    c.create_arc(left_body,       top,             left_body+2*R,       top+2*R,
                 start=90, extent=90, style="arc", outline="#000", width=OUT_W)
    c.create_arc(right_body-2*R,  top,             right_body,          top+2*R,
                 start=0,  extent=90, style="arc", outline="#000", width=OUT_W)
    c.create_arc(right_body-2*R,  bottom-2*R,      right_body,          bottom,
                 start=270,extent=90, style="arc", outline="#000", width=OUT_W)
    c.create_arc(left_body,       bottom-2*R,      left_body+2*R,       bottom,
                 start=180,extent=90, style="arc", outline="#000", width=OUT_W)

    # 6. 箭头描边
    c.create_polygon(arr, fill="", outline="#000", width=OUT_W, joinstyle=tk.MITER)

    # 7. 文字置顶 & 调整大小
    c.tag_raise(txt_id)
    width  = right_body + (AW if not is_bot else 2)
    height = bottom + 2
    c.config(width=width, height=height)
    c.pack()
    return c




# ========= 显示一条消息 =========
def show(sender,msg):
    row = tk.Frame(inner,bg="#FFF5EC")
    row.pack(fill="x",anchor="w" if sender=="bot" else "e",pady=6)

    if sender=="bot":
         # 左侧：头像 ➜ 间距 ➜ 气泡（留足空间给三角）
        tk.Label(row, image=bot_av, bg="#FFF5EC").pack(side="left", padx=(0, 6))
        bubble(row, msg, "#E1F7C2", True).pack(side="left", padx=(10, 0))  # ← 左侧多留 16 px
    else:
        tk.Label(row, image=user_av, bg="#FFF5EC").pack(side="right", padx=(3, 0))
        bubble(row, msg, "#F7F5B4", False).pack(side="right", padx=(0, 8), pady=4)

    canvas.yview_moveto(1.0)

# ========= DeepSeek & 发送 =========
try: TOKEN=open("../../common/token.txt").read().strip()
except: TOKEN=""

def ask_api(u):
    global emo
    if not TOKEN: return "⚠️ Auth missing"
    try:
        r=requests.post(API_URL,files={"prompt":(None,f"{PERSONAS[persona_key]}\n{u}")},
                        headers={"Authorization":f"Bearer {TOKEN}"},timeout=12)
        r.raise_for_status(); txt=r.json().get("content","")
    except Exception as e: txt=f"⚠️ Error: {e}"
    emo_match = EMO_RE.search(txt) or EMO_RE.search(u)
    emo = emo_match.group(1).lower() if emo_match else random.choice(DF_EMO)
    return txt

def tts_async(txt): threading.Thread(target=lambda: text2audio(txt,VCN.get(persona_key,"")),daemon=True).start()
def clean_tts(s):  return re.sub(r'\*.*?\*','',s).replace("\n"," ")

def send_msg(event=None):
    user = entry.get().strip(); entry.delete(0,"end")
    if not user: return
    show("user",user)
    bot = ask_api(user)
    try: open(EMO_FILE,"w").write(emo)
    except: pass
    show("bot",bot); tts_async(clean_tts(bot))

entry.bind("<Return>",send_msg)
canvas.bind_all("<MouseWheel>",lambda e: canvas.yview_scroll(int(-e.delta/120),"units"))

root.mainloop()
