const fs = require("fs");
const path = require("path");

function getAllCategories(tableName = "categories") {
  const filePath = path.join(__dirname, "db.json");

  // 1. Read file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 2. Return categories
  return jsonData[tableName];
}

function getCategoryById(tableName = "categories", categoryId) {
  const filePath = path.join(__dirname, "db.json");

  // 1. Read file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 2. Find category
  const category = jsonData[tableName].find((item) => item.id === categoryId);

  if (!category) {
    return { success: false, message: `${tableName} not found` };
  }

  // 3. Return found category
  return category;
}



function updateCategoryById(tableName = "categories", categoryId, updatedData) {
  const filePath = path.join(__dirname, "db.json");

  // 1. Read file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 2. Find category index
  const categoryIndex = jsonData[tableName].findIndex(
    (item) => item.id === categoryId
  );

  if (categoryIndex === -1) {
    return { success: false, message: "Category not found" };
  }

  // 3. Update category
    jsonData[tableName][categoryIndex] = {
    ...jsonData[tableName][categoryIndex],
    ...updatedData,
  };

  // 4. Write back to file
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

  return jsonData[tableName][categoryIndex];
}

function insertCategory(tableName = "categories", newCategory) {
  const filePath = path.join(__dirname, "db.json");

  // 1. Read file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 2. Generate unique ID (simple random 4-char hex)
  const generateId = () => Math.random().toString(16).substr(2, 4);
  const id = generateId();

  const categoryWithId = {
    id,
    ...newCategory,
  };

  // 3. Add new category to array
  jsonData[tableName].push(categoryWithId);

  // 4. Write back to file
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

  return categoryWithId;
}

function deleteCategoryById(tableName = "categories", categoryId) {
  const filePath = path.join(__dirname, "db.json");

  // 1. Read file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 2. Find category index
  const categoryIndex = jsonData[tableName].findIndex(
    (item) => item.id === categoryId
  );

  if (categoryIndex === -1) {
    return { success: false, message: "Category not found" };
  }

  // 3. Remove item
  const deletedCategory = jsonData[tableName].splice(categoryIndex, 1)[0];

  // 4. Write back to file
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

  return deletedCategory;
}






module.exports = {
  getAllCategories,
  getCategoryById,
  updateCategoryById,       
  insertCategory,
  deleteCategoryById
};