const mainframeURL = `https://zebra.talktothemainframe.com:3390`;
let haveUploadedLparNamesToCheckbox = false;

const updateCheckboxContainerNames = (tableData) => {
  document.querySelector("#lparChecklistContainer").innerHTML = ``;

  const list = document.createElement("ul");
  list.classList.add("checklist");

  for (const lpar of tableData) {
    const lparName = `${lpar.CPCPPNAM.trim()}`;
    if (
      (`${lpar.CPCPLTOU.trim()}`.length > 0 ||
        `${lpar.CPCPPEFU.trim()}`.length > 0) &&
      lparName.length > 0
    ) {
      const listItem = document.createElement("li");
      listItem.classList.add("checklist-item");

      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("checkbox-label");
      checkboxLabel.innerText = lparName;

      const checkbox = document.createElement("input");
      checkbox.classList.add("checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.addEventListener("change", (e) => {
        DisplayLparInfo();
      });

      listItem.append(checkbox, checkboxLabel);
      list.appendChild(listItem);
    }
  }
  document.querySelector("#lparChecklistContainer").append(list);
  haveUploadedLparNamesToCheckbox = true;
};

const DisplayLparInfo = async () => {
  const collectedData = await axios.get(`${mainframeURL}/rmfm3?report=CPC`);
  if (!haveUploadedLparNamesToCheckbox) {
    updateCheckboxContainerNames(collectedData.data.table);
  }

  const graphData = [];

  for (const lpar of collectedData.data.table) {
    const lparName = `${lpar.CPCPPNAM.trim()}`;
    const physTotalUtils = `${lpar.CPCPLTOU.trim()}`;
    const effectiveUtils = `${lpar.CPCPPEFU.trim()}`;

    if (
      (physTotalUtils.length > 0 || effectiveUtils.length > 0) &&
      lparName.length > 0
    ) {
      const targetLabel = Array.from(
        document.querySelectorAll(".checkbox-label")
      ).filter((lparLabel) => {
        return lparLabel.innerText === lparName;
      })[0];

      if (Array.from(targetLabel.parentElement.children)[0].checked) {
        const graphEntry = {
          x: lparName,
          phys: physTotalUtils,
          eff: effectiveUtils,
        };
        graphData.push(graphEntry);
      }
    }
  }

  const cfg = {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Physical Total Utils",
          data: graphData,
          backgroundColor: "#a300008f",
          parsing: {
            yAxisKey: "phys",
          },
        },
        {
          label: "Effective Utils",
          data: graphData,
          backgroundColor: "#0003a38f",
          parsing: {
            yAxisKey: "eff",
          },
        },
      ],
    },
  };
  try {
    myChart.destroy();
  } catch (err) {}
  myChart = new Chart(document.getElementById("lparUtilisationGraph"), cfg);
};

DisplayLparInfo();
