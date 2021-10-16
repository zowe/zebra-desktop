// const mainframeURL = `https://zebra.talktothemainframe.com:3390`;
let haveUploadedCPUNamesToCheckbox = false;

const updateCPUCheckboxContainerNames = (tableData) => {
  document.querySelector("#cpuChecklistContainer").innerHTML = ``;

  const list = document.createElement("ul");
  list.classList.add("system-checklist");

  for (const sysClass of tableData) {
    const name = `${sysClass.SYSNAMVC.trim()}`;
    if (parseFloat(`${sysClass.SYSCPUVC.trim()}`) > 0 && name.length > 0) {
      const listItem = document.createElement("li");
      listItem.classList.add("system-checklist-item");

      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("system-checkbox-label");
      checkboxLabel.innerText = name;

      const checkbox = document.createElement("input");
      checkbox.classList.add("system-checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.addEventListener("change", (e) => {
        DisplayCPUInfo();
      });

      listItem.append(checkbox, checkboxLabel);
      list.appendChild(listItem);
    }
  }
  document.querySelector("#cpuChecklistContainer").append(list);
  haveUploadedCPUNamesToCheckbox = true;
};

const DisplayCPUInfo = async () => {
  const collectedData = await axios.get(`${mainframeURL}/rmfm3?report=SYSINFO`);
  if (!haveUploadedCPUNamesToCheckbox) {
    updateCPUCheckboxContainerNames(collectedData.data.table);
  }

  const graphData = [];
  for (const lpar of collectedData.data.table) {
    const name = `${lpar.SYSNAMVC.trim()}`;
    const utils = `${lpar.SYSCPUVC.trim()}`;

    if (parseFloat(utils) > 0 && name.length > 0) {
      const targetLabel = Array.from(
        document.querySelectorAll(".system-checkbox-label")
      ).filter((label) => {
        return label.innerText === name;
      })[0];

      if (Array.from(targetLabel.parentElement.children)[0].checked) {
        const graphEntry = {
          x: name,
          util: utils,
        };
        graphData.push(graphEntry);
      }
    }
  }

  const cfgSystem = {
    type: "bar",
    data: {
      datasets: [
        {
          label: "CPU Util of Workload",
          data: graphData,
          backgroundColor: "#a300008f",
          parsing: {
            yAxisKey: "util",
          },
        },
      ],
    },
  };
  try {
    sysChart.destroy();
  } catch (err) {}
  sysChart = new Chart(
    document.getElementById("cpuUtilisationGraph"),
    cfgSystem
  );
};

DisplayCPUInfo();
