// const mainframeURL = `https://zebra.talktothemainframe.com:3390`;
let haveUploadedJobNamesToCheckbox = false;

const updateJobCheckboxContainerNames = (tableData) => {
  document.querySelector("#usageChecklistContainer").innerHTML = ``;

  const list = document.createElement("ul");
  list.classList.add("usage-checklist");

  for (const sysClass of tableData) {
    const name = `${sysClass.JUSPJOB.trim()}`;
    if (parseFloat(`${sysClass.JUSPCPUD.trim()}`) > 0 && name.length > 0) {
      const listItem = document.createElement("li");
      listItem.classList.add("usage-checklist-item");

      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("usage-checkbox-label");
      checkboxLabel.innerText = name;

      const checkbox = document.createElement("input");
      checkbox.classList.add("usage-checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.addEventListener("change", (e) => {
        DisplayUsageInfo();
      });

      listItem.append(checkbox, checkboxLabel);
      list.appendChild(listItem);
    }
  }
  document.querySelector("#usageChecklistContainer").append(list);
  haveUploadedCPUNamesToCheckbox = true;
};

const DisplayUsageInfo = async () => {
  const collectedData = await axios.get(`${mainframeURL}/rmfm3?report=USAGE`);
  if (!haveUploadedJobNamesToCheckbox) {
    updateJobCheckboxContainerNames(collectedData.data.table);
  }

  const graphData = [];
  for (const job of collectedData.data.table) {
    const name = `${job.JUSPJOB.trim()}`;
    const utils = `${job.JUSPCPUD.trim()}`;

    if (parseFloat(utils) > 0 && name.length > 0) {
      const targetLabel = Array.from(
        document.querySelectorAll(".usage-checkbox-label")
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

  const cfgUsage = {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Job Usage Time",
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
    usageChart.destroy();
  } catch (err) {}
  usageChart = new Chart(document.getElementById("jobUsageGraph"), cfgUsage);
};

DisplayUsageInfo();
