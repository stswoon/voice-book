import sys

# tested on python 3.10
# pip install torch numpy torchaudio omegaconf
# https://colab.research.google.com/github/snakers4/silero-models/blob/master/examples_tts.ipynb#scrollTo=7b9e704a
def tts(input_text):
    import torch
    import os
    import time

    # https://github.com/snakers4/silero-models#installation-and-basics
    print_flush("step1 - setup device")

    device = torch.device('cpu')  # TODO: gpu
    # torch.set_num_threads(4)
    torch.set_num_threads(1)

    print_flush("step2 - find or download model")

    local_file = 'tts-v3-ru-model.pt'
    model_url = 'https://models.silero.ai/models/tts/ru/v3_1_ru.pt'
    # torch._C._jit_set_profiling_mode(False)
    # local_file = 'tts-v4-ru-model.pt'
    # model_url = 'https://models.silero.ai/models/tts/ru/v4_ru.pt'
    # https://models.silero.ai/models/tts/ru/
    if not os.path.isfile(local_file):
        local_file = '../../../' + local_file
        if not os.path.isfile(local_file):
            print_flush("downloading model")
            torch.hub.download_url_to_file(model_url, local_file)
        else:
            print_flush("model found in parent folder")
    else:
        print_flush("model found")

    print_flush("step3 - setup model")

    model = torch.package.PackageImporter(local_file).load_pickle("tts_models", "model")
    model.to(device)
    # aidar, baya, kseniya, xenia, eugene
    # speaker = 'baya'
    # speaker = 'xenia'
    # speaker = 'eugene'
    # speaker = 'kseniya'
    speaker = 'aidar'
    # speaker = 'petr'
    # speaker = voice
    sample_rate = 48000
    # put_accent=True
    # put_yo=True

    print_flush("step4 - generate file")

    t = time.time()
    # audio = model.apply_tts(text=input_text, speaker=speaker, sample_rate=sample_rate)
    # import torchaudio
    # torchaudio.save('LJ037-0171_resave.wav', audio.unsqueeze(0), sample_rate=16000)
    # https://stackoverflow.com/questions/62543843/cannot-import-torch-audio-no-audio-backend-is-available
    audio_paths = model.save_wav(text=input_text, speaker=speaker, sample_rate=sample_rate)
    # audio_paths = model.save_wav(text=input_text, speaker=speaker, sample_rate=sample_rate, put_accent=put_accent, put_yo=put_yo)
    print_flush(audio_paths)
    t = time.time() - t

    print_flush("step5 - Finish, time=" + str(t))

def print_flush(s):
    print(s)
    sys.stdout.flush()

def start():
    print("step0 - check args")
    sys.stdout.flush()
    # https://stackoverflow.com/a/63573649  - because of error while run from node "UnicodeEncodeError: 'charmap' codec can't encode characters in position 12-19: character maps to <undefined>"
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')

    if len(sys.argv) > 1:
        # https://stackoverflow.com/a/33329251
        input_text = sys.argv[1]
        print("input_text=" + input_text)
        # voice = sys.argv[2]
        # print("voice=" + voice)
        tts(input_text)
    else:
        print("no args so skip start automatically")
    sys.stdout.flush()
start()
