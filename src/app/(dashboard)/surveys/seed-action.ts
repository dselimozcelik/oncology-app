'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SurveyQuestion } from '@/lib/supabase/types';

const predefinedSurveys: { title: string; description: string; questions: SurveyQuestion[] }[] = [
  {
    title: 'Kırılganlık Anketi',
    description: 'Hastanın fiziksel kırılganlık düzeyini değerlendiren anket.',
    questions: [
      {
        id: 'k1',
        type: 'multiple_choice',
        label: 'İştahınız azaldı mı?',
        options: ['Hayır', 'Hafif azaldı', 'Belirgin azaldı'],
      },
      {
        id: 'k2',
        type: 'multiple_choice',
        label: 'Son 3 ayda kilo kaybettiniz mi?',
        options: ['Hayır', '1–3 kilo', '3 kilodan fazla', 'Bilmiyorum'],
      },
      {
        id: 'k3',
        type: 'multiple_choice',
        label: 'Günlük hareketliliğiniz nasıl?',
        options: ['Dışarı çıkabiliyorum', 'Baston/yardım ile', 'Yatak/koltuk bağımlısı'],
      },
      {
        id: 'k4',
        type: 'multiple_choice',
        label: 'Son 3 ayda ciddi stres ya da ağır hastalık geçirdiniz mi?',
        options: ['Hayır', 'Evet'],
      },
      {
        id: 'k5',
        type: 'multiple_choice',
        label: 'Unutkanlık, depresyon gibi sorunlarınız var mı?',
        options: ['Hayır', 'Hafif sorun var', 'Ciddi sorun var'],
      },
      {
        id: 'k6_boy',
        type: 'number',
        label: 'Boy (cm)',
      },
      {
        id: 'k6_kilo',
        type: 'number',
        label: 'Kilo (kg)',
      },
      {
        id: 'k6_yas',
        type: 'number',
        label: 'Yaş',
      },
      {
        id: 'k7',
        type: 'multiple_choice',
        label: 'Sağlığınızı yaşıtlarınıza göre nasıl görüyorsunuz?',
        options: ['Daha kötü', 'Bilmiyorum', 'Aynı', 'Daha iyi'],
      },
    ],
  },
  {
    title: 'Uyku Anketi',
    description: 'Uyku düzeni, uyku problemleri ve gündüz işlevi değerlendirmesi.',
    questions: [
      { id: 'u1', type: 'text', label: 'Genelde saat kaçta yatıyorsunuz? (ör. 23:00)' },
      { id: 'u2', type: 'number', label: 'Uykuya dalmanız genelde ne kadar sürüyor? (dakika)' },
      { id: 'u3', type: 'text', label: 'Sabahları genelde saat kaçta kalkıyorsunuz? (ör. 07:00)' },
      { id: 'u4', type: 'number', label: 'Ortalama gecelik uyku süreniz ne kadar? (saat)' },
      {
        id: 'u5',
        type: 'multiple_choice',
        label: 'Uykuya dalmakta zorlandınız mı?',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u6',
        type: 'multiple_choice',
        label: 'Gece sık sık uyandınız mı? (ör. tuvalet, ağrı, nefes darlığı, kötü rüya)',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u7',
        type: 'multiple_choice',
        label: 'Uykunuzda horlama veya nefes darlığı oldu mu?',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u8',
        type: 'multiple_choice',
        label: 'Uyku ilacı kullandınız mı?',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u9',
        type: 'multiple_choice',
        label: 'Gün içinde uykunuz geldi, ayık kalmakta zorlandınız mı?',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u10',
        type: 'multiple_choice',
        label: 'Uykunuz işlerinizde/isteğinizde sorun yarattı mı?',
        options: ['😌 Hiç olmadı (0)', '🙂 Nadiren (1)', '😟 Ara sıra (2)', '😫 Sık sık (3)'],
      },
      {
        id: 'u11',
        type: 'multiple_choice',
        label: 'Genel olarak uyku kalitenizi nasıl değerlendirirsiniz?',
        options: ['🌙 Çok iyi (0)', '🙂 İyi (1)', '😐 Kötü (2)', '😫 Çok kötü (3)'],
      },
    ],
  },
  {
    title: 'Kanser Rekürrensi Korkusu Anketi',
    description: 'Kanser nüksü korkusuna yönelik duygusal tepkiler, risk algılaması ve düşünme sıklığı.',
    questions: [
      {
        id: 'kr1',
        type: 'multiple_choice',
        label: 'Kanserin tekrar etme olasılığı konusunda kaygı veya endişe hissettim.',
        options: ['😌 0', '🙂 1', '😐 2', '😟 3', '😫 4'],
      },
      {
        id: 'kr2',
        type: 'multiple_choice',
        label: 'Kanserin yeniden ortaya çıkmasından korktum.',
        options: ['😌 0', '🙂 1', '😐 2', '😟 3', '😫 4'],
      },
      {
        id: 'kr3',
        type: 'multiple_choice',
        label: 'Kanser nüksü konusunda endişeli hissetmenin normal olduğunu düşündüm.',
        options: ['😌 0', '🙂 1', '😐 2', '😟 3', '😫 4'],
      },
      {
        id: 'kr4',
        type: 'multiple_choice',
        label: 'Kanserin tekrarlama ihtimalini düşündüğümde, ölüm, acı veya aileme etkileri gibi olumsuz düşünceler aklıma geldi.',
        options: ['😌 0', '🙂 1', '😐 2', '😟 3', '😫 4'],
      },
      {
        id: 'kr5',
        type: 'multiple_choice',
        label: 'İyileştiğime ve kanserin geri dönmeyeceğine inanıyorum. (Ters madde)',
        options: ['😌 0', '🙂 1', '😐 2', '😟 3', '😫 4'],
      },
      {
        id: 'kr6',
        type: 'multiple_choice',
        label: 'Kendimi kanser tekrarına karşı ne kadar risk altında hissediyorum?',
        options: ['😌 Hiç risk altında değilim (0)', '🙂 Az risk (1)', '😐 Orta risk (2)', '😟 Yüksek risk (3)', '😫 Çok yüksek risk (4)'],
      },
      {
        id: 'kr7',
        type: 'multiple_choice',
        label: 'Kanser nüksü ihtimalini ne sıklıkla düşündüm?',
        options: ['😌 Hiç (0)', '🙂 Ayda birkaç kez (1)', '😐 Haftada birkaç kez (2)', '😟 Günde birkaç kez (3)', '😫 Günde birçok kez (4)'],
      },
      {
        id: 'kr8',
        type: 'multiple_choice',
        label: 'Bu konu hakkında günde ne kadar zaman düşündüm?',
        options: ['😌 Hiç (0)', '🙂 Birkaç saniye (1)', '😐 Birkaç dakika (2)', '😟 Birkaç saat (3)', '😫 Saatlerce (4)'],
      },
      {
        id: 'kr9',
        type: 'multiple_choice',
        label: 'Kanser nüksü ile ilgili düşünmeye ne zamandır devam ediyorum?',
        options: ['😌 Hiç (0)', '🙂 Birkaç haftadır (1)', '😐 Birkaç aydır (2)', '😟 Birkaç yıldır (3)', '😫 Çok uzun yıllardır (4)'],
      },
    ],
  },
  {
    title: 'Anksiyete ve Depresyon Anketi (HADS)',
    description: 'Hastane Anksiyete ve Depresyon Ölçeği — son birkaç günü değerlendirin.',
    questions: [
      // Anksiyete (A)
      {
        id: 'h1',
        type: 'multiple_choice',
        label: 'Kendimi gergin ve sinirli hissediyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h2',
        type: 'multiple_choice',
        label: 'İçimde kötü bir şey olacakmış hissi var.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h3',
        type: 'multiple_choice',
        label: 'Kendimi huzursuz hissettiğim anlar oluyor.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h4',
        type: 'multiple_choice',
        label: 'Sebepsiz yere paniklediğim oldu.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h5',
        type: 'multiple_choice',
        label: 'Sanki bir felaket olacakmış gibi tedirgin oluyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h6',
        type: 'multiple_choice',
        label: 'Rahatlayamıyorum, gevşeyemiyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h7',
        type: 'multiple_choice',
        label: 'Endişelerim beni meşgul ediyor.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      // Depresyon (D)
      {
        id: 'h8',
        type: 'multiple_choice',
        label: 'Eskiden keyif aldığım şeylerden keyif alabiliyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h9',
        type: 'multiple_choice',
        label: 'Bir şeylerle ilgilenirken tat aldığımı hissediyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h10',
        type: 'multiple_choice',
        label: 'Günlük işlere odaklanmakta zorluk yaşıyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h11',
        type: 'multiple_choice',
        label: 'Kendimi yorgun ve bitkin hissediyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h12',
        type: 'multiple_choice',
        label: 'Dış görünüşüme ve günlük yaşamıma özen gösterebiliyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h13',
        type: 'multiple_choice',
        label: 'Her şeyden zevk alma yeteneğim azaldı.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
      {
        id: 'h14',
        type: 'multiple_choice',
        label: 'Kendimi mutsuz veya çökkün hissediyorum.',
        options: ['😌 Hiç (0)', '🙂 Hafif (1)', '😐 Orta (2)', '😟 Belirgin (3)'],
      },
    ],
  },
  {
    title: 'Durum-Özellik Kaygı Anketi (STAI-S)',
    description: 'Şu anda kendinizi nasıl hissettiğinizi en iyi anlatan seçeneği işaretleyin.',
    questions: [
      { id: 's1', type: 'multiple_choice', label: 'Şu anda sakinim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's2', type: 'multiple_choice', label: 'Kendimi emniyette hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's3', type: 'multiple_choice', label: 'Şu anda sinirlerim gergin.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's4', type: 'multiple_choice', label: 'Pişmanlık duygusu içindeyim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's5', type: 'multiple_choice', label: 'Şu anda huzur içindeyim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's6', type: 'multiple_choice', label: 'Şu anda hiç keyfim yok.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's7', type: 'multiple_choice', label: 'Başıma geleceklerden endişe ediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's8', type: 'multiple_choice', label: 'Kendimi dinlenmiş hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's9', type: 'multiple_choice', label: 'Şu anda kaygılıyım.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's10', type: 'multiple_choice', label: 'Kendimi rahat hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's11', type: 'multiple_choice', label: 'Kendime güvenim var.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's12', type: 'multiple_choice', label: 'Şu anda asabım bozuk.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's13', type: 'multiple_choice', label: 'Çok sinirliyim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's14', type: 'multiple_choice', label: 'Sinirlerimin çok gergin olduğunu hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's15', type: 'multiple_choice', label: 'Kendimi rahatlamış hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's16', type: 'multiple_choice', label: 'Şu anda halimden memnunum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's17', type: 'multiple_choice', label: 'Şu anda endişeliyim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's18', type: 'multiple_choice', label: 'Heyecandan kendimi şaşkına dönmüş hissediyorum.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's19', type: 'multiple_choice', label: 'Şu anda sevinçliyim.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
      { id: 's20', type: 'multiple_choice', label: 'Şu anda keyfim yerinde.', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Çok (3)', '😫 Tamamıyla (4)'] },
    ],
  },
  {
    title: 'Mindfulness Anketi (MAAS-15)',
    description: 'Farkındalık Dikkat Ölçeği — günlük yaşamdaki farkındalık düzeyinizi değerlendirir. Yüksek puan = yüksek farkındalık.',
    questions: [
      { id: 'm1', type: 'multiple_choice', label: 'Bir duyguyu yaşarken bazen onu fark etmem zaman alır.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm2', type: 'multiple_choice', label: 'Dikkatsizlik veya dalgınlık yüzünden bir şeyleri kırar/dökerim.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm3', type: 'multiple_choice', label: 'Anda olanlara odaklanmakta zorlanırım.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm4', type: 'multiple_choice', label: 'Bir yere giderken etrafta olup biteni fark etmeden hızlıca yürürüm.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm5', type: 'multiple_choice', label: 'Fiziksel gerginlik veya rahatsızlık hissini, belirginleşene kadar fark etmeyebilirim.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm6', type: 'multiple_choice', label: 'Birinin adını duyduktan hemen sonra unutabilirim.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm7', type: 'multiple_choice', label: '"Otomatik pilotta" gibi farkındalıksız hareket ederim.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm8', type: 'multiple_choice', label: 'Yaptığım işlerin içinden geçerim ama gerçekten dikkatli olduğumu söyleyemem.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm9', type: 'multiple_choice', label: 'Bir hedefe o kadar odaklanırım ki o anda ne yaptığımdan koparım.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm10', type: 'multiple_choice', label: 'Bazı işleri tamamen otomatik şekilde yaparım ve farkında olmam.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm11', type: 'multiple_choice', label: 'Biriyle konuşurken bir kulağım orada, bir kulağım başka şeyde olur.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm12', type: 'multiple_choice', label: 'Araba kullanırken "otomatik pilot" şeklinde gidip sonra neden oraya gittiğimi anlamam.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm13', type: 'multiple_choice', label: 'Kendimi sık sık geçmiş ya da gelecekle ilgili düşünceler içinde bulurum.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm14', type: 'multiple_choice', label: 'Bir şeyler yaparken dikkatimi tamamen vermediğim olur.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
      { id: 'm15', type: 'multiple_choice', label: 'Farkında olmadan atıştırdığım/gereksizce yediğim olur.', options: ['😫 Neredeyse her zaman (1)', '😟 Çok sık (2)', '🙂 Ara sıra sık (3)', '😐 Nadiren (4)', '😌 Çok nadiren (5)', '🧘‍♂️ Neredeyse hiç (6)'] },
    ],
  },
  {
    title: 'Yaşam Kalitesi Anketi (EORTC QLQ-C30)',
    description: 'Geçtiğimiz hafta boyunca günlük yaşamınızdaki durumları değerlendirmek için kullanılır.',
    questions: [
      { id: 'q1', type: 'multiple_choice', label: 'Ağır bir torba/valiz taşırken zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q2', type: 'multiple_choice', label: 'Uzun yürüyüşte zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q3', type: 'multiple_choice', label: 'Kısa yürüyüşte zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q4', type: 'multiple_choice', label: 'Günün büyük kısmını oturarak/yatarak geçirme ihtiyacınız oldu mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q5', type: 'multiple_choice', label: 'Yemek, giyinme, banyo, tuvalet gibi işlerde yardıma ihtiyaç duydunuz mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q6', type: 'multiple_choice', label: 'İş/günlük aktiviteleri yapmanıza engel olan bir durum oldu mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q7', type: 'multiple_choice', label: 'Hobilerinizi/boş zaman aktivitelerinizi yapmaya engel oldu mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q8', type: 'multiple_choice', label: 'Nefes darlığı yaşadınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q9', type: 'multiple_choice', label: 'Ağrı yaşadınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q10', type: 'multiple_choice', label: 'Dinlenme ihtiyacı hissettiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q11', type: 'multiple_choice', label: 'Uyumakta zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q12', type: 'multiple_choice', label: 'Kendinizi güçsüz hissettiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q13', type: 'multiple_choice', label: 'İştahınız azaldı mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q14', type: 'multiple_choice', label: 'Bulantı oldu mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q15', type: 'multiple_choice', label: 'Kusma oldu mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q16', type: 'multiple_choice', label: 'Kabızlık yaşadınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q17', type: 'multiple_choice', label: 'İshal oldunuz mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q18', type: 'multiple_choice', label: 'Yoruldunuz mu?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q19', type: 'multiple_choice', label: 'Ağrılarınız günlük yaşamınızı etkiledi mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q20', type: 'multiple_choice', label: 'TV izlerken/gazete okurken dikkat toplamada zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q21', type: 'multiple_choice', label: 'Gerginlik hissettiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q22', type: 'multiple_choice', label: 'Endişelendiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q23', type: 'multiple_choice', label: 'Kendinizi kızgın hissettiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q24', type: 'multiple_choice', label: 'Bunalıma girdiniz mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q25', type: 'multiple_choice', label: 'Bazı şeyleri hatırlamakta zorlandınız mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q26', type: 'multiple_choice', label: 'Fiziksel durum/tedavi aile yaşamınızı etkiledi mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q27', type: 'multiple_choice', label: 'Fiziksel durum/tedavi sosyal yaşamınızı etkiledi mi?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      { id: 'q28', type: 'multiple_choice', label: 'Tedavi/fiziksel durum maddi zorluk yarattı mı?', options: ['😌 Hiç (1)', '🙂 Biraz (2)', '😟 Oldukça (3)', '😫 Çok (4)'] },
      {
        id: 'q29',
        type: 'scale',
        label: 'Geçen haftaki genel sağlığınızı nasıl değerlendirirsiniz?',
        min: 1,
        max: 7,
      },
      {
        id: 'q30',
        type: 'scale',
        label: 'Geçen haftaki genel yaşam kalitenizi nasıl değerlendirirsiniz?',
        min: 1,
        max: 7,
      },
    ],
  },
];

export async function seedSurveys() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Oturum bulunamadı' };

  // Tüm hastaları al
  const { data: patients } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'patient');

  let created = 0;

  for (const survey of predefinedSurveys) {
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        doctor_id: user.id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions as unknown as Record<string, unknown>[],
      })
      .select('id')
      .single();

    if (error || !data) continue;

    // Tüm hastalara ata
    if (patients && patients.length > 0) {
      const rows = patients.map((p) => ({
        survey_id: data.id,
        patient_id: p.id,
      }));
      await supabase.from('survey_assignments').insert(rows);
    }

    created++;
  }

  revalidatePath('/surveys');
  return { success: true, count: created };
}
