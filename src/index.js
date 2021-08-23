import getData from './model';
import csv from '../assets/mock.csv';
import createGraph from './graph';
import createTable from './table';
import "../styles/index.css";


const graphContainer = document.getElementById('graph')
const tableContainer = document.getElementById('table')

const {data, min, max} = getData(csv);
const {update} = createGraph(graphContainer, data, min, max);
const table = createTable(tableContainer, csv);

table.addEventListener('update', (newData) => {
  const {data, min, max} = getData(newData);
  update(data);
});

