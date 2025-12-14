import speech_recognition as sr

def voice_to_text():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)

    try:
        return r.recognize_google(audio)
    except:
        return "Could not understand audio"
