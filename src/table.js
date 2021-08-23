import { Grid } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.scss";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";


function createTable(container, data) {
  let grid = null;
  const eventHash = {};
  const columnDefs = Object.keys(data[0]).map((field) => {
    return { field };
  });
  var gridOptions = {
    columnDefs,
    defaultColDef: {
      flex: 1,
      minWidth: 110,
      editable: true,
      resizable: true,
    },
    rowData: data,
    onCellValueChanged: (event) => {
      const newData = getAllRows();
      console.log(eventHash);
      eventHash.update && eventHash.update(newData);
    },
  };
  grid = new Grid(container, gridOptions);
  console.log(grid);
  console.log(getAllRows());
  function getAllRows() {
    let rowData = [];
    grid.gridOptions.api.forEachNode(node => {
      rowData.push(node.data)
    });
    return rowData;
  }
  
  // debugger
  return {
    // grid,
    addEventListener: (event, callback) => {
      if (!eventHash[event]) eventHash[event] = callback;
      console.log(event, eventHash);
    },
  };
}

export default createTable;
