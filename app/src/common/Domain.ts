export enum Province {
  北海道 = 1,
  青森,
  岩手,
  宮城,
  秋田,
  山形,
  福島,
  茨城,
  栃木,
  群馬,
  埼玉,
  千葉,
  東京,
  神奈川,
  新潟,
  山梨,
  長野,
  富山,
  石川,
  福井,
  岐阜,
  静岡,
  愛知,
  三重,
  滋賀,
  京都,
  大阪,
  兵庫,
  奈良,
  和歌山,
  鳥取,
  島根,
  岡山,
  広島,
  山口,
  徳島,
  香川,
  愛媛,
  高知,
  福岡,
  佐賀,
  長崎,
  熊本,
  大分,
  宮崎,
  鹿児島,
  沖縄,
}

export enum Genre {
  ポップス,
  ロック,
  ハードロック,
  メタル,
  パンク,
  メロコア,
  ハードコア,
  ビジュアル系,
  ブルース,
  ファンク,
  ソウル,
  ゴスペル,
  アカペラ,
  ボサノバ,
  レゲエ,
  スカ,
  ロカビリー,
  ヒップホップ,
  エレクトロニック,
  クラシック,
  アニソン,
  ボカロ,
  その他,
}

export enum Instrument {
  ボーカル,
  ドラム,
  ベース,
  ギター,
  ピアノ,
  オルガン,
  キーボード,
  パーカッション,
  トランペット,
  トロンボーン,
  サックス,
  管楽器,
  弦楽器,
  作詞作曲,
  アレンジャー,
  DJ,
  録音エンジニア,
  その他,
}

export enum Gender {
  女性,
  男性,
  その他,
}

export enum ArticleGender {
  女性,
  男性,
  その他,
  混合,
}

export enum ArticleAge {
  Teens = '10代',
  Twenties = '20代',
  Thirties = '30代',
  Forties = '40代',
  Fifties = '50代',
  Sixties = '60代',
  OverSeventies = '70以上',
}

export enum ArticleKind {
  メンバー募集,
  加入希望,
}

export enum Plan {
  Free,
  Standard,
}

export enum SignUpTask {
  VerifyEmail,
  AgreeTerms,
  WriteProfile,
  WriteArticle,
}

export type User = {
  id: string;
  email: string;
  signUpTasks: { [id: number]: boolean };
  signUpComplete: boolean;
};

export type Profile = {
  id: string;
  userId: string;
  displayName: string;
  plan: Plan;
};

export type Article = {
  id: string;
  userId: string;
  profile: Profile;
  kind: ArticleKind;
  title: string;
  content: string;
  age: ArticleAge;
  gender: ArticleGender;
  province: Province;
  location: string;
  genres: Genre[];
  instruments: Instrument[];
  images: string[];
  url: string;
};

export type Message = {
  id: string;
  fromId: string;
  timestamp: number;
  text: string;
};

export type Talk = {
  id: string;
  between: string;
  userIds: string[];
  messages: Message[];
};

export type Subscription = {
  id: string;
  stripeId: string;
  userId: string;
  plan: Plan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};
