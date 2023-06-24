const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const file_path = path.join(__dirname, "../data/data.csv");

router.get("/total_items", (req, res) => {
  const { start_date, end_date, department } = req.body;
  let total_items = 0;
  fs.createReadStream(file_path)
    .pipe(csv())
    .on("data", (data) => {
      if (
        data.department === department &&
        data.date >= start_date &&
        data.date <= end_date
      )
        total_items += parseInt(data.seats);
    })
    .on("end", () => {
      return res.json(total_items);
    })
    .on("error", (error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/nth_most_total_item", (req, res) => {
  const { start_date, end_date, item_by, n } = req.body;
  const results = [];

  fs.createReadStream(file_path)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      const filteredData = results.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate >= new Date(start_date) && itemDate <= new Date(end_date)
        );
      });
      filteredData.sort((a, b) => {
        if (item_by === "quantity") {
          return b.seats - a.seats;
        } else if (item_by === "price") {
          return b.amount - a.amount;
        }
        return 0;
      });
      const nthItem = filteredData[n - 1];
      return res.json(nthItem.software);
    })
    .on("error", (error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/percentage_of_department_wise_sold_items", (req, res) => {
  const { start_date, end_date } = req.body;
  const results = [];
  fs.createReadStream(file_path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const filteredData = results.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate >= new Date(start_date) && itemDate <= new Date(end_date)
        );
      });
      const departmentCounts = {};
      filteredData.forEach((item) => {
        const department = item.department;
        if (departmentCounts.hasOwnProperty(department)) {
          departmentCounts[department] += parseInt(item.seats);
        } else {
          departmentCounts[department] = parseInt(item.seats);
        }
      });
      const totalSoldItems = Object.values(departmentCounts).reduce(
        (acc, count) => acc + count,
        0
      );
      const departmentPercentages = {};
      for (const department in departmentCounts) {
        const count = departmentCounts[department];
        const percentage = ((count / totalSoldItems) * 100).toFixed(2);
        departmentPercentages[department] = `${percentage}%`;
      }

      res.json(departmentPercentages);
    });
});

router.get("/monthly_sales", (req, res) => {
  const { product, year } = req.body;
  const results = [];
  fs.createReadStream(file_path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const filteredData = results.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          item.software === product && itemDate.getFullYear() === parseInt(year)
        );
      });
      const monthlySales = Array(12).fill(0);
      filteredData.forEach((item) => {
        const itemMonth = new Date(item.date).getMonth();
        monthlySales[itemMonth] += parseFloat(item.seats);
      });
      res.json(monthlySales);
    });
});

module.exports = router;
