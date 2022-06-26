import React, { useState, useEffect, useRef } from "react";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "./App.css";

import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { AutoComplete } from "primereact/autocomplete";
import { DataTable } from "primereact/datatable";

import { CountryService } from "./service/CountryService";

function App() {
  const [countryValue, setCountryValue] = useState(null);
  const [selectedCountryValue, setSelectedCountryValue] = useState(null);
  const [selectedCityValue, setSelectedCityValue] = useState(null);
  const [selectedAutoValueCity, setSelectedAutoValueCity] = useState(null);
  const [autoFilteredValue, setAutoFilteredValue] = useState([]);
  const [data1, setData1] = useState([]);

  const [products, setProducts] = useState([]);
  const toast = useRef(null);
  const exports = useRef(null);

  const columns = [
    { field: "code2", header: "Code" },
    { field: "name", header: "Name" },
    { field: "capital", header: "Capital" },
    { field: "region", header: "Region" },
    { field: "subregion", header: "Subregion" },
  ];



  const footer = `In total there are ${
    products ? products.length : 0
  } products.`;

  useEffect(() => {
    const countryService = new CountryService();
    countryService.getCountries().then((data) => setCountryValue(data));
    countryService.getCountries().then((data) => setProducts(data));
  }, []);

  const exportColumns = columns.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const dynamicColumns = columns.map((col, i) => {
    return <Column key={col.field} field={col.field} header={col.header} />;
  });

  const searchCountry = (event) => {
    setTimeout(() => {
      if (!event.query.trim().length) {
        setAutoFilteredValue([...countryValue]);
      } else {
        setAutoFilteredValue(
          countryValue.filter((country) => {
            return country.name
              .toLowerCase()
              .startsWith(event.query.toLowerCase());
          })
        );
      }
    }, 250);
  };

  const onRowReorder = (e) => {
    setProducts(e.value);
    toast.current.show({
      severity: "success",
      summary: "Rows Reordered",
      life: 3000,
    });
  };

  const exportPdf = () => {
    import("jspdf").then((jsPDF) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF.default(0, 0);
        doc.autoTable(exportColumns, products);
        doc.save("products.pdf");
      });
    });
  };
  const exportCSV = (selectionOnly) => {
    exports.current.exportCSV({ selectionOnly });
  };

  

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(products);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, "products");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then(module => {
        if (module && module.default) {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data = new Blob([buffer], {
                type: EXCEL_TYPE
            });

            module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        }
    });
}

  const header = (
    <div className="flex align-items-center export-buttons">
      <Button type="button" icon="pi pi-file" className="mr-2" />
      <Button
        type="button"
        icon="pi pi-file-excel"
        className="mr-2 p-button-success"
        onClick={exportExcel}
        data-pr-tooltip="PDF"
      />
      <Button
        type="button"
        icon="pi pi-file-pdf"
        className="mr-2 p-button-warning"
        onClick={exportPdf}
        data-pr-tooltip="PDF"
      />
      <Button
        type="button"
        icon="pi pi-filter"
        className="mr-2 p-button-help ml-auto"
      />
    </div>
  );

  const searchCity = (event) => {
    if (data1) {
      setSelectedAutoValueCity(
        data1.states.filter((country) => {
          return country.name
            .toLowerCase()
            .startsWith(event.query.toLowerCase());
        })
      );
    } else {
      setSelectedAutoValueCity([]);
    }
  };
  const onCountryChange = (event) => {
    setData1(event);
    setSelectedCountryValue(event);
    setSelectedCityValue([]);
  };


  return (
    <div className="App">
      <div className="card">
        <h5>PrimeReact AutoComplete</h5>
        <AutoComplete
          dropdown
          field="name"
          onChange={(e) => onCountryChange(e.value)}
          completeMethod={searchCountry}
          value={selectedCountryValue}
          suggestions={autoFilteredValue}
          placeholder="Search Country"
        ></AutoComplete>
        <AutoComplete
          value={selectedCityValue}
          placeholder="Search City"
          dropdown
          completeMethod={searchCity}
          suggestions={selectedAutoValueCity}
          onChange={(e) => setSelectedCityValue(e.value)}
          field="name"
          style={{ marginLeft: 10 }}
        ></AutoComplete>
      </div>
      <div className="card mt-8">
        <h5>PrimeReact DataTable</h5>
        <div class="flex flex-wrap align-items-center justify-content-center card-container ">
          <DataTable
            header={header}
            value={products}
            footer={footer}
            paginator
            size="medium"
            showGridlines
            stripedRows
            rows={10}
            reorderableColumns
            onRowReorder={onRowReorder}
            responsiveLayout="scroll"
            style={{ width: "70%", border: "5px solid rgb(3, 90, 90)" }}
          >
            <Column rowReorder style={{ width: "3em" }} />
            {dynamicColumns}
          </DataTable>
        </div>
      </div>
    </div>
  );
}

export default App;
