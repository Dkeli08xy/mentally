// src\utils\localStorage.js

// 简单反应时挑战
class ReactionTimeEasyStorage {
  static KEY = "psych_reaction_easy";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

// 困难反应时挑战
class ReactionTimeHardStorage {
  static KEY = "psych_reaction_hard";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

// 简单记忆衰减
class MemoryDecayEasyStorage {
  static KEY = "psych_memory_easy";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

// 困难记忆衰减
class MemoryDecayHardStorage {
  static KEY = "psych_memory_hard";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

// 简单微表情判断
class MicroExpressionEasyStorage {
  static KEY = "psych_expression_easy";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

// 困难微表情判断
class MicroExpressionHardStorage {
  static KEY = "psych_expression_hard";
  
  static save(data) {
    const list = this.getList();
    if (!data.id) {
      data.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    list.push(data);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return data.id;
  }
  
  static getList() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static getById(id) {
    const list = this.getList();
    return list.find(item => item.id == id) || null;
  }
  
  static removeById(id) {
    const list = this.getList();
    const newList = list.filter(item => item.id != id);
    localStorage.setItem(this.KEY, JSON.stringify(newList));
  }
  
  static removeByIndex(index) {
    const list = this.getList();
    list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  
  static updateById(id, newData) {
    const list = this.getList();
    const index = list.findIndex(item => item.id == id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData, id };
      localStorage.setItem(this.KEY, JSON.stringify(list));
      return true;
    }
    return false;
  }
  
  static clear() {
    localStorage.removeItem(this.KEY);
  }
}

export {
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage,
};