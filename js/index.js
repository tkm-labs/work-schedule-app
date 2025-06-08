  // 合計時間を更新
  function updateTotalTime(shiftColumn) {
    const timeSpans = shiftColumn.querySelectorAll('.task-time');
    let total = 0;

    timeSpans.forEach(span => {
      const value = parseInt(span.textContent.trim(), 10);
      if (!isNaN(value)) total += value;
    });

    const totalTimeDisplay = shiftColumn.querySelector('.total-time');
    totalTimeDisplay.textContent = `合計：${total}分`;
  }

  // タスク追加時の処理
  document.querySelectorAll('.add-task').forEach(button => {
    button.addEventListener('click', () => {
      const shiftColumn = button.closest('.shift-column');
      const container = shiftColumn.querySelector('.task-container');
      const template = document.getElementById('task-card-template');
      const newCard = template.content.cloneNode(true);

      container.appendChild(newCard);

      // 少し遅らせて合計更新（DOM反映後）
      setTimeout(() => updateTotalTime(shiftColumn), 0);
    });
  });

  // 作業時間編集時に更新（contenteditable対象）
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('task-time')) {
      const shiftColumn = e.target.closest('.shift-column');
      if (shiftColumn) updateTotalTime(shiftColumn);
    }
  });

  // 編集確定時にも更新（念のため blur 対応）
  document.addEventListener('blur', (e) => {
    if (e.target.classList.contains('task-time')) {
      const shiftColumn = e.target.closest('.shift-column');
      if (shiftColumn) updateTotalTime(shiftColumn);
    }
  }, true); // useCapture = true にしないと blur 捕捉できない


// 作業カードの削除
let selectedCard = null;

// クリックされた task-card を選択状態にする
document.addEventListener('dblclick', (e) => {
  const card = e.target.closest('.task-card');
  // 一度全てのカードから選択クラスを外す
  document.querySelectorAll('.task-card').forEach(c => c.classList.remove('selected'));

  if (card) {
    selectedCard = card;
    card.classList.add('selected'); // 選択状態の見た目もつけるなら
  } else {
    selectedCard = null;
  }
});
// キーボードで削除
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCard) {
    const shiftColumn = selectedCard.closest('.shift-column');
    selectedCard.remove();
    selectedCard = null;
    updateTotalTime(shiftColumn);
  }
});




// ドラッグ&ドロップ
document.addEventListener("DOMContentLoaded", () => {
  const shiftColumns = document.querySelectorAll(".task-container");

  document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task-card")) {
      e.target.classList.add("dragging");
    }
  });

  document.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("task-card")) {
      e.target.classList.remove("dragging");
    }
  });

  shiftColumns.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(dragging);
      } else {
        container.insertBefore(dragging, afterElement);
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
});



// 備考ボタンについて
document.addEventListener("DOMContentLoaded", () => {
    // 備考ボタンの動作
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("toggle-remark")) {
        const card = e.target.closest(".task-card");
        const remarkBox = card.querySelector(".remark-box");
        remarkBox.classList.toggle("d-none");
      }
    });
  
    // 備考入力でボタン色変更
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("remark-textarea")) {
        const card = e.target.closest(".task-card");
        const button = card.querySelector(".toggle-remark");
        if (e.target.value.trim() !== "") {
          button.classList.remove("btn-outline-info");
          button.classList.add("btn-warning");
        } else {
          button.classList.remove("btn-warning");
          button.classList.add("btn-outline-info");
        }
      }
    });
  });
  

 // カード生成関数
function createTaskCard(task) {
  const template = document.getElementById("task-card-template");
  const card = template.content.cloneNode(true);

  card.querySelector(".editable-task-name").textContent = task.taskName || "作業";
  card.querySelector(".meal-select").value = task.meal || "喫食";
  card.querySelector(".category-select").value = task.category || "区分";
  card.querySelector(".task-time").textContent = task.time || "20";
  card.querySelector(".remark-textarea").value = task.remark || "";

  if (task.remark && task.remark.trim() !== "") {
    card.querySelector(".remark-box").classList.remove("d-none");
  }

  return card;
}

// (省略) 既存コードはそのまま維持してください
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveBtn");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const data = {
        facilityName: document.getElementById("facilityName").value,
        meals: {
          breakfast: {
            time: document.getElementById("breakfast-time").value,
            qty: document.getElementById("breakfast-qty").value
          },
          lunch: {
            time: document.getElementById("lunch-time").value,
            qty: document.getElementById("lunch-qty").value
          },
          snack: {
            time: document.getElementById("snack-time").value,
            qty: document.getElementById("snack-qty").value
          },
          dinner: {
            time: document.getElementById("dinner-time").value,
            qty: document.getElementById("dinner-qty").value
          }
        },
        shifts: {
          morning: getShiftTasks("morning"),
          lunch: getShiftTasks("lunch"),
          dinner: getShiftTasks("dinner")
        }
      };

      console.log("保存内容：", data); // 確認用
      localStorage.setItem("shiftWorkData", JSON.stringify(data));
      alert("保存しました！");
    });
  }
});
// 作業カードの作成
function createTaskCard(task) {
  const template = document.getElementById("task-card-template");
  const card = template.content.cloneNode(true);

  card.querySelector(".editable-task-name").textContent = task.taskName || "作業";
  card.querySelector(".meal-select").value = task.meal || "喫食";
  card.querySelector(".category-select").value = task.category || "区分";
  card.querySelector(".task-time").textContent = task.time || "20";
  card.querySelector(".remark-textarea").value = task.remark || "";

  if (task.remark && task.remark.trim() !== "") {
    card.querySelector(".remark-box").classList.remove("d-none");
  }

  return card;
}

// 合計時間を更新
function updateTotalTime(shiftColumn) {
  const timeSpans = shiftColumn.querySelectorAll('.task-time');
  let total = 0;
  timeSpans.forEach(span => {
    const value = parseInt(span.textContent.trim(), 10);
    if (!isNaN(value)) total += value;
  });
  const totalTimeDisplay = shiftColumn.querySelector('.total-time');
  if (totalTimeDisplay) totalTimeDisplay.textContent = `合計：${total}分`;
}

// ✅ 正しい getShiftTasks 関数（1回だけ定義！）
function getShiftTasks(shift) {
  const column = document.querySelector(`.shift-column[data-shift="${shift}"]`);
  if (!column) return [];

  const container = column.querySelector(".task-container");
  if (!container) return [];

  const tasks = [];
  container.querySelectorAll(".task-card").forEach(card => {
    const taskName = card.querySelector(".editable-task-name")?.innerText.trim() || "";
    const meal = card.querySelector(".meal-select")?.value || "";
    const category = card.querySelector(".category-select")?.value || "";
    const time = card.querySelector(".task-time")?.innerText.trim() || "";
    const remark = card.querySelector(".remark-textarea")?.value.trim() || "";
    const startTime = ""; // 未使用

    tasks.push({ taskName, meal, category, time, remark, startTime });
  });

  return tasks;
}

// 🔽 現在の全データを集める
function collectCurrentData() {
  return {
    facilityName: document.getElementById("facility-name").value,
    meals: {
      breakfast: {
        time: document.getElementById("breakfast-time").value,
        qty: document.getElementById("breakfast-qty").value
      },
      lunch: {
        time: document.getElementById("lunch-time").value,
        qty: document.getElementById("lunch-qty").value
      },
      snack: {
        time: document.getElementById("snack-time").value,
        qty: document.getElementById("snack-qty").value
      },
      dinner: {
        time: document.getElementById("dinner-time").value,
        qty: document.getElementById("dinner-qty").value
      }
    },
    shifts: {
      morning: getShiftTasks("morning"),
      lunch: getShiftTasks("lunch"),
      dinner: getShiftTasks("dinner")
    }
  };
}

// ✅ JSONとして保存
document.getElementById("export-json").addEventListener("click", () => {
  const data = collectCurrentData();
  const facilityName = data.facilityName || "工程表";
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = facilityName + ".json";
  a.click();
  URL.revokeObjectURL(url);
});

// ✅ JSONを読み込んで復元
document.getElementById("import-json").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      restoreFromData(data);
      alert("読み込み完了！");
    } catch (err) {
      alert("JSONの読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
});

// ✅ データの復元
function restoreFromData(data) {
  document.getElementById("facility-name").value = data.facilityName || "";

  // 食事時間
  if (data.meals) {
    document.getElementById("breakfast-time").value = data.meals.breakfast?.time || "";
    document.getElementById("breakfast-qty").value = data.meals.breakfast?.qty || "";
    document.getElementById("lunch-time").value = data.meals.lunch?.time || "";
    document.getElementById("lunch-qty").value = data.meals.lunch?.qty || "";
    document.getElementById("snack-time").value = data.meals.snack?.time || "";
    document.getElementById("snack-qty").value = data.meals.snack?.qty || "";
    document.getElementById("dinner-time").value = data.meals.dinner?.time || "";
    document.getElementById("dinner-qty").value = data.meals.dinner?.qty || "";
  }

  // シフトの作業カード
  if (data.shifts) {
    ["morning", "lunch", "dinner"].forEach(shift => {
      const container = document.querySelector(`.shift-column[data-shift="${shift}"] .task-container`);
      if (!container) return;

      container.innerHTML = ""; // 一旦クリア

      const tasks = data.shifts[shift] || [];
      tasks.forEach(task => {
        const card = createTaskCard(task);
        container.appendChild(card);
      });

      const shiftColumn = container.closest(".shift-column");
      updateTotalTime(shiftColumn);
    });
  }
}

// ✅ 保存ボタン（localStorageに保存）
document.getElementById("saveBtn").addEventListener("click", () => {
  const data = collectCurrentData();
  localStorage.setItem("shiftWorkData", JSON.stringify(data));
  alert("保存しました！");
});
