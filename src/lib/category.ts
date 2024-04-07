const categories: { [id: number]: string } = {
  100: "CD, DVD, ブルーレイ",
  200: "本, 雑誌, 漫画",
  300: "スマホ, タブレット, PC",
  400: "家電, カメラ, AV機器",
  999: "その他",
};

const subcategories: {[id: number]: {[id:number]: string}} = {
  100 : {
    101: "CD",
    102: "DVD",
    103: "ブルーレイ",
    104: "レコード",
    105: "テープ",
  },
  200 : {
    201: "本",
    202: "雑誌",
    203: "漫画",
    204: "文庫",
    205: "新書",
    206: "絵本",
  },
  300: {
    310: "スマホ・携帯",
    320: "タブレット",
    330: "PC",
    340: "PC周辺機器",
  },
  400: {
    410: "家電",
    420: "カメラ",
    430: "AV機器",
  }
}

const subsubcategories: {[id: number]: {[id:number]: string}} = {
  310: {
    311: "スマートフォン本体",
    312: "スマートフォンアクセサリ",
    313: "SIMカード",
  },
  320: {
    321: "タブレット本体",
    322: "タブレットアクセサリ",
  },
  330: {
    331: "ノートPC",
    332: "デスクトップPC",
  },
  340: {
    341: "モニター",
    342: "キーボード",
    343: "マウス",
  },
  410: {
    411: "テレビ",
    412: "エアコン",
    413: "冷蔵庫",
  },
  420: {
    421: "デジタルカメラ",
    422: "ビデオカメラ",
    423: "レンズ",
  },
  430: {
    431: "プロジェクター",
    432: "スピーカー",
    433: "アンプ",
  }
}

function flatObj(obj: {[id: number]: {[id:number]: string}}) {
  const flattedObj = new Object() as {[id: number]: {[id:number]: string}};
  Object.keys(obj).forEach(key => {
    const value = obj[Number(key)];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattedObj, flatObj(value));
    } else {
      flattedObj[Number(key)] = value;
    }
  });
  return flattedObj;
};

const idToCategory = (id: number): string[] => {
  if (id in categories) {
    return [categories[id]];
  } else {
    const categoryNumber = Number(id.toString().slice(0, 1) + "00");
    if (categoryNumber in subcategories) {
      if (id in subcategories[categoryNumber]) {
        return [categories[categoryNumber], subcategories[categoryNumber][id]];
      } else {
        const subcategoryNumber = Number(id.toString().slice(0, 2) + "0");
        if (subcategoryNumber in subsubcategories) {
          if (id in subsubcategories[subcategoryNumber]) {
            return [categories[categoryNumber], subcategories[categoryNumber][subcategoryNumber], subsubcategories[subcategoryNumber][id]];
          } else {
            return []
          }
        } else {
          return []
        }
      }
    } else {
      return []
    }
  }
}

const categoryToId = (category: string): number => {
  const categoryId = Object.keys(categories).find(
    (id) => categories[Number(id)] === category
  );
  if (categoryId) {
    return Number(categoryId);
  } else {
    const subcategoryId = Object.keys(flatObj(subcategories)).find(
      (id) => flatObj(subcategories)[Number(id)] === category
    );
    if (subcategoryId) {
      return Number(subcategoryId);
    } else {
      const subsubcategoryid = Object.keys(flatObj(subsubcategories)).find(
        (id) => flatObj(subsubcategories)[Number(id)] === category
      );
      if (subsubcategoryid) {
        return Number(subsubcategoryid);
      } else {
        return 0;
      }
    }
  }
}

const getSubcategories = (id: number): number[] => {
  if (id in subcategories) {
    return Object.keys(subcategories[id]).map(Number);
  } else if (id in subsubcategories) {
    return Object.keys(subsubcategories[id]).map(Number);
  } else {
    return [];
  }
}

const getParentCategory = (id: number): number => {
  if (id in flatObj(subcategories)) {
    return Number(id.toString().slice(0, 1) + "00");
  } else if (id in flatObj(subsubcategories)) {
    return Number(id.toString().slice(0, 2) + "0");
  } else {
    return 0;
  }
}

const hasSubcategories = (id: number): boolean => {
  return id in subcategories || id in subsubcategories;
}

export { categories, idToCategory, categoryToId, hasSubcategories, getSubcategories, getParentCategory };
