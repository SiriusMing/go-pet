import tkinter as tk

# 创建主窗口
root = tk.Tk()
root.title("简单的计数器")
root.geometry("300x200")

# 标签
label = tk.Label(root, text="计数: 0", font=("Arial", 24))
label.pack(pady=20)

# 计数器
count = 0

# 更新标签的文本
def update_label():
    global count
    count += 1
    label.config(text=f"计数: {count}")

# 按钮
button = tk.Button(root, text="点击我", font=("Arial", 14), command=update_label)
button.pack()

# 运行主循环
root.mainloop()
