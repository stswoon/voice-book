# pip install torch
# pip install numpy
# pip install torchaudio omegaconf

print("q0")

# V3
import os
import torch

print("q1")

device = torch.device('cpu')
torch.set_num_threads(4)
local_file = 'model.pt'

print("q2")

if not os.path.isfile(local_file):
    torch.hub.download_url_to_file('https://models.silero.ai/models/tts/ru/v3_1_ru.pt',
                                   local_file)  
    
print("q3")    

model = torch.package.PackageImporter(local_file).load_pickle("tts_models", "model")
model.to(device)

example_text = 'роблокс дорс амонг ас ставь лайк подпешись на канал но главное не будь жадиной и учи уроки двоешник и будь ты человеком хотите историю расскажу да? нуладно рассказываюкакието люди в школе ёршиком проводят по стенам ааааааа а а а а а а  аа а а а а а а а а а а а а а а а а а а а  а а kiss лягушка и шемпанзе и люди и наушник и рыба и каралы неандертальци опила ооооооооооо о о о о о о о о а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я  стаки бёрд  амогус и абобус копибара В недрах тундры выдры в г+етрах т+ырят в вёдра ядра кедров.'
sample_rate = 48000
speaker='baya'

#https://github.com/snakers4/silero-models#installation-and-basics
#aidar, baya, kseniya, xenia, eugene

speaker='xenia'
speaker='aidar'

print("q4")

audio_paths = model.save_wav(text=example_text,
                             speaker=speaker,
                             sample_rate=sample_rate)

print("q5")