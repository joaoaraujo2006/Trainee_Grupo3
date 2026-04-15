const canvas = document.getElementById("tasksChart");

if (canvas) {
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["A Fazer", "Em andamento", "Em review", "Concluído"],
      datasets: [{
        label: "Quantidade de tarefas",
        data: [6, 4, 3, 5],
        backgroundColor: [
          "rgba(255, 107, 107, 0.7)",
          "rgba(255, 184, 77, 0.7)",
          "rgba(110, 170, 255, 0.7)",
          "rgba(125, 255, 155, 0.7)"
        ],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }
  });
}