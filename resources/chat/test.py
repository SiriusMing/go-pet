from tts import text2audio, remove
import re
text = "who are you who are you who are you!"
vcn = 'x4_enus_lucy_education'
'''
x4_EnUs_Laura_education
x4_enuk_ashleigh_assist
x4_enus_lucy_education
x4_EnUs_Lindsay_assist
'''
#text2audio(text, vcn)
#remove()
# 每个角色对应的语音合成模型
VCN_MAPPING = {
    "Rana_Kaname": "x4_enus_lucy_education",
    "Taki_Shiina": "x4_EnUs_Laura_education",
    "Normal mode": "x4_enuk_ashleigh_assist",
    "Anon_Chihaya": "x4_enus_lucy_education",
    "Soyo_Nagasaki": "x4_EnUs_Lindsay_assist",
    "Takamatsu_Tomori": "x4_EnUs_Laura_education"
}


def clean_response_for_tts(ai_response: str) -> str:
    # 去除 **动作** 这样的文本，包括换行中的动作描述
    cleaned = re.sub(r'\*.*?\*', '', ai_response)
    # 去除多余的空白符或多余换行
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

ai_response = "*Ims guitar softly whileanglancing sideways at yoU*Mmm..I'm fine, l guess. The matchalatte thiswas a little too sweetYou? You're notthough.overworking yourself again, are you?uietly plucks a melancholic chord*If youre tired, you should rest. ill playsomething for you. Maybe. lf you asknicely."

print(clean_response_for_tts(ai_response))