# pip install torch numpy torchaudio omegaconf

import sys

# https://stackoverflow.com/a/33329251
outputFile = sys.argv[1]
inputText = sys.argv[2]
print("outputFile=" + outputFile)
print("textToSpeach=" + inputText)


def tts(outputFile, inputText):
    import torch
    import os
    # https://github.com/snakers4/silero-models#installation-and-basics
    print("q1")
    device = torch.device('cpu')
    torch.set_num_threads(4)
    local_file = 'tts-model.pt'

    print("q2")
    if not os.path.isfile(local_file):
        torch.hub.download_url_to_file(
            'https://models.silero.ai/models/tts/ru/v3_1_ru.pt', local_file)

    print("q3")
    model = torch.package.PackageImporter(
        local_file).load_pickle("tts_models", "model")
    model.to(device)
    # aidar, baya, kseniya, xenia, eugene
    sample_rate = 48000
    speaker = 'baya'
    speaker = 'xenia'
    speaker = 'aidar'
    # put_accent=True
    # put_yo=True

    print("q4")
    audio_paths = model.save_wav(
        text=inputText, speaker=speaker, sample_rate=sample_rate)
        # text=inputText, speaker=speaker, sample_rate=sample_rate, put_accent=put_accent, put_yo=put_yo)
    print(audio_paths)

tts(outputFile, inputText)