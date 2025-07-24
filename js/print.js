document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("shiftWorkData");
  if (!saved) return;

  const data = JSON.parse(saved);
  window.shiftData = data; // 保存用にも使える

  // ラベル変換マップ
  const mealLabels = {
    nothing: "-",
    morning: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    snack: "おやつ",
    "n-morning": "翌朝",
    喫食: "喫食"
  };

  const categoryLabels = {
    nothing: "-",
    main: "主菜",
    hot: "温菜",
    cold: "冷菜",
    snack: "おやつ",
    "m-h": "主菜／温菜",
    "m-c": "主菜／冷菜",
    "h-c": "温菜／冷菜",
    区分: "区分"
  };

  // 施設名
  document.getElementById("facilityName").value = data.facilityName || "";

  // 食事時間
  const meals = ["breakfast", "lunch", "snack", "dinner"];
  meals.forEach(meal => {
    document.getElementById(`${meal}-time`).value = data.meals?.[meal]?.time || "";
    document.getElementById(`${meal}-qty`).value = data.meals?.[meal]?.qty || "";
  });

  // 各シフトデータ描画
  const shifts = ["morning", "lunch", "dinner"];
  shifts.forEach(shift => {
    const container = document.querySelector(`.shift-column[data-shift="${shift}"]`);
    const tbody = container.querySelector("tbody");
    const totalDisplay = container.querySelector(".total-time");

    const tasks = data.shifts?.[shift] || [];
    let totalMinutes = 0;

    tasks.forEach((task, index) => {
      const tr = document.createElement("tr");

      // 開始時間（編集可能）
      const tdStart = document.createElement("td");
      const inputStart = document.createElement("input");
      inputStart.type = "text";
      inputStart.className = "form-control input-start";
      inputStart.value = task.startTime || "";
      inputStart.dataset.index = index;
      inputStart.dataset.shift = shift;
      tdStart.appendChild(inputStart);

      // 作業名
      const tdName = document.createElement("td");
      tdName.textContent = task.taskName || "";

      // 喫食（変換）
      const tdMeal = document.createElement("td");
      tdMeal.textContent = mealLabels[task.meal] || task.meal;

      // 区分（変換）
      const tdCategory = document.createElement("td");
      tdCategory.textContent = categoryLabels[task.category] || task.category;

      // 作業時間
      const tdTime = document.createElement("td");
      tdTime.textContent = `${task.time || ""}分`;

      // 備考（編集可能）
      const tdRemark = document.createElement("td");
      const inputRemark = document.createElement("textarea");
      inputRemark.type = "text";
      inputRemark.className = "form-control remark-input";
      inputRemark.value = task.remark || "";
      inputRemark.dataset.index = index;
      inputRemark.dataset.shift = shift;
      tdRemark.appendChild(inputRemark);

      // 合計時間加算
      const min = parseInt(task.time);
      if (!isNaN(min)) totalMinutes += min;

      // 行に追加
      tr.appendChild(tdStart);
      tr.appendChild(tdName);
      tr.appendChild(tdMeal);
      tr.appendChild(tdCategory);
      tr.appendChild(tdTime);
      tr.appendChild(tdRemark);

      tbody.appendChild(tr);
    });

    totalDisplay.textContent = `合計：${totalMinutes}分`;
  });

  // 保存ボタン追加
  const saveButton = document.createElement("button");
  saveButton.textContent = "編集内容を保存";
  saveButton.className = "btn btn-secondary me-2";
  saveButton.id = "savePrint";
  saveButton.addEventListener("click", saveUpdatedData);

  const navbar = document.querySelector(".navbar .d-flex.gap-2");
  if (navbar) navbar.prepend(saveButton);
});

// 保存処理：備考・開始時間を localStorage に反映
function saveUpdatedData() {
  const updatedData = window.shiftData;
  if (!updatedData) return;

  // 各入力欄の値を data に戻す
  document.querySelectorAll(".input-start").forEach(input => {
    const shift = input.dataset.shift;
    const index = input.dataset.index;
    updatedData.shifts[shift][index].startTime = input.value;
  });

  document.querySelectorAll(".remark-input").forEach(input => {
    const shift = input.dataset.shift;
    const index = input.dataset.index;
    updatedData.shifts[shift][index].remark = input.value;
  });

  localStorage.setItem("shiftWorkData", JSON.stringify(updatedData));
  alert("編集内容を保存しました！");
}
