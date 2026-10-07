import type { Bilingual } from '../lib/content'

export type Prayer = { tib: string; phon: string; translation: Bilingual }

/** Short prayers used in the guided session. Not yet reviewed by a teacher. */
export const REFUGE: Prayer = {
  tib: 'སངས་རྒྱས་ཆོས་དང་ཚོགས་ཀྱི་མཆོག་རྣམས་ལ། །བྱང་ཆུབ་བར་དུ་བདག་ནི་སྐྱབས་སུ་མཆི། །བདག་གིས་སྦྱིན་སོགས་བགྱིས་པའི་བསོད་ནམས་ཀྱིས། །འགྲོ་ལ་ཕན་ཕྱིར་སངས་རྒྱས་འགྲུབ་པར་ཤོག །',
  phon: 'sangye chö dang tsok kyi chok nam la / jangchub bardu dak ni kyab su chi / dak gi jin sok gyipé sönam kyi / dro la pen chir sangye drub par shok',
  translation: {
    en: 'In the Buddha, the Dharma and the supreme Sangha I take refuge until enlightenment. Through the merit of generosity and the other perfections, may I attain buddhahood to benefit all beings.',
    zh: '诸佛正法贤圣僧，直至菩提我皈依；我以所修布施等，为利众生愿成佛。',
  },
}

export const DEDICATION: Prayer = {
  tib: 'བསོད་ནམས་འདི་ཡིས་ཐམས་ཅད་གཟིགས་པ་ཉིད། །ཐོབ་ནས་ཉེས་པའི་དགྲ་རྣམས་ཕམ་བྱས་ཏེ། །སྐྱེ་རྒ་ན་འཆིའི་རྦ་རླབས་འཁྲུགས་པ་ཡི། །སྲིད་པའི་མཚོ་ལས་འགྲོ་བ་སྒྲོལ་བར་ཤོག །',
  phon: 'sönam di yi tamché zikpa nyi / tob né nyepé dra nam pam jé té / kye ga na chi ba lab trukpa yi / sipé tso lé drowa drol war shok',
  translation: {
    en: 'By this merit may all beings attain omniscience and defeat the enemy, wrongdoing. From the stormy waves of birth, old age, sickness and death, from the ocean of saṃsāra, may I free all beings.',
    zh: '以此福德证遍知，摧伏一切过患敌；生老病死如浪涛，愿度众生离有海。',
  },
}
