# https://stackoverflow.com/a/33329251
import sys

input_text = sys.argv[1]
print("input_text=" + input_text)


# tested on python 3.10
# pip install torch numpy torchaudio omegaconf
def tts(input_text):
    import torch
    import os
    # https://github.com/snakers4/silero-models#installation-and-basics
    print("step1 - device")
    device = torch.device('cpu')
    torch.set_num_threads(4)

    print("step2 - find or download model")
    local_file = 'tts-model.pt'
    if not os.path.isfile(local_file):
        local_file = '../../' + local_file
        if not os.path.isfile(local_file):
            torch.hub.download_url_to_file('https://models.silero.ai/models/tts/ru/v3_1_ru.pt', local_file)

    print("step3 - setup model")
    model = torch.package.PackageImporter(local_file).load_pickle("tts_models", "model")
    model.to(device)
    # aidar, baya, kseniya, xenia, eugene
    sample_rate = 48000
    speaker = 'baya'
    speaker = 'xenia'
    speaker = 'aidar'
    # put_accent=True
    # put_yo=True

    print("step4 - generate file")
    audio_paths = model.save_wav(text=input_text, speaker=speaker, sample_rate=sample_rate)
    # text=inputText, speaker=peaker, sample_rate=sample_rate, put_accent=put_accent, put_yo=put_yo)
    print(audio_paths)


tts(input_text)
