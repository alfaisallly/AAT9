%% Check impulse response offset
% rme= 3159 edirol=3295
clear all
gain = -18;
offset = -3997;
save('offset.mat','offset');
cmd = 'test'
[f_axis,f_result,t_axis,t_result] = Lacoustics(cmd,gain,offset);
plot(t_result)

%% Calibrate the soundcard
clear all
gain = -26;
load('offset.mat')
cmd = 'cali_soundcard'
Lacoustics(cmd,gain,offset);

%% Show calibration of soundcard
clear all
gain = -26;
load('offset.mat')
cmd = 'test'
[f_axis,f_result,t_axis,t_result] = Lacoustics(cmd,gain,offset);
load('calibration.mat')
transfer_function = f_result./calibration.preamp_transfer_function;
result = 20*log10(abs(transfer_function));
semilogx(f_axis,result)
hold on
grid on
axis([20 20000 -1 1])
xlabel('Frequency [Hz]')
ylabel('[dB]')
clear calibration

%% Calibrate the microphone
clear all
cmd = 'cali_mic'
gain = -18;
load('offset.mat')
Lacoustics(cmd,gain,offset);

%% Show calibration of microphone
load('calibration.mat')
p0 = 20*10^(-6);
fs = 48000; 
blength = 3;
soundcard = audioDeviceReader('SampleRate',fs,'SamplesPerFrame',2048);          % setting up audio object
buffer = zeros(blength * fs, 1);            % initializing audio buffer
tic;
while toc < 10
    audioin = soundcard()/calibration.mic_sensitivity;                  % fetch samples from soundcard
    buffer = [buffer(2049:end); audioin];   % update buffer
end
out = 20*log10(rms(buffer)*sqrt(2)/p0)
clear calibration


%% Make impulse response in first point 
clear all
cmd = 'transfer'
gain = -18;
load('offset.mat')
[f_axis,f_result,t_axis,t_result] = Lacoustics(cmd,gain,offset);

result=20*log10(abs(f_result)/(20*10^-6));
number = 1;
result_mean(:,number) = movmean(result,100);

figure(1)
%semilogx(f_axis,result)
semilogx(f_axis,result_mean)
hold on
grid on
axis([20 20000 40 120])
xlabel('Frequency [Hz]')
ylabel('Level [dB]')

%% Add more test points 
number = number+1; % run number
[f_axis,f_result,t_axis,t_result] = Lacoustics(cmd,gain,offset);
result=20*log10(abs(f_result)/(20*10^-6));
result_mean(:,number) = movmean(result,100);
figure(1)
semilogx(f_axis,result_mean)

%% Mean the test and show result

mean_of_all_run = mean(result_mean,2);
figure(2)
semilogx(f_axis,mean_of_all_run)
hold on
grid on
axis([20 20000 40 120])
xlabel('Frequency [Hz]')
ylabel('Level [dB]')

%% sound meter
fs = 44100; 
[L_pF,L_pS] = OneThirdOctaveAnalyser(0.125,1,abs(ifft(mean_of_all_run)),fs);
bar(L_pS)
hold on
bar(L_pF)


%% make reverb calculation
%clear all
%cmd = 'transfer'
%gain = -18;
%[f_axis,f_result,t_axis,t_result] = Lacoustics(cmd,gain);
clear all


fs = 44100;
BW = '1 octave'; 
N = 6;
F0 = 1000;

oneOctaveFilter = octaveFilter('FilterOrder', N, ...
    'CenterFrequency', F0, 'Bandwidth', BW, 'SampleRate', fs);
F0 = getANSICenterFrequencies(oneOctaveFilter);
F0(F0<124) = [];
F0(F0>4001) = [];
Nfc = length(F0);
for i=1:Nfc
    oneOctaveFilterBank{i} = octaveFilter('FilterOrder', N, ...
        'CenterFrequency', F0(i), 'Bandwidth', BW, 'SampleRate', fs);
end

load('impulse.mat');
load('impulse_axis.mat')

interval = 3000;


sqrt_impulse = (t_result).^2;
mid = sqrt_impulse(end/2-interval:end/2+interval);
noise_floor = rms(mid);

b = 1;
for i=interval+1:interval:length(sqrt_impulse)
    part = sqrt_impulse(i-interval:i+interval);
    impulse_level = rms(part);
    b = b+1;
    if impulse_level <= noise_floor
        break
    end
end


N = i-interval-1;


for i=1:Nfc

output = oneOctaveFilterBank{i}(t_result); 


t_reverb = (output(1:N)).^2;
figure(1)
plot(t_reverb)
hold on


for t=1:1:length(t_reverb)
Q(t) = trapz(t_reverb(t:end));
end

res = 10*log10(Q/max(Q));

figure(2)
plot(t_axis(1:N),res)
hold on

sample = find(res < -5.001);
start = sample(1);

sample = find(res < -25.001);
stop = sample(1);

T_20(i) = ((stop-start)*3)/44100

sample = find(res < -5.001);
start = sample(1);

sample = find(res < -35.001);
stop = sample(1);

T_30(i) = ((stop-start)*2)/fs

end
