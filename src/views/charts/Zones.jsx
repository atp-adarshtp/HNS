import React, { useEffect, useState } from "react";
import { 
  CCard, CCardBody, CCol, CCardHeader, CRow, CSpinner, 
  CFormInput, CButton, CTable, CTableBody, CTableHeaderCell, 
  CTableRow, CTableDataCell, CTableHead
} from "@coreui/react";
import axios from "axios";
import "./CustomScrollbar.css";

const Charts = () => {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);
  const [zoneId, setZoneId] = useState(null);
  const [zoneSearch, setZoneSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get("https://dns.hetzner.com/api/v1/zones", {
          headers: { "Auth-API-Token": API_TOKEN },
        });
        setZones(response.data.zones);
        setFilteredZones(response.data.zones);
      } catch (error) {
        setError("Failed to fetch zones");
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, [API_TOKEN]);

  useEffect(() => {
    if (!zoneId) return;
    setLoadingRecords(true);
    const fetchRecords = async () => {
      try {
        const response = await axios.get(
          `https://dns.hetzner.com/api/v1/records?zone_id=${zoneId}`,
          {
            headers: { "Auth-API-Token": API_TOKEN },
          }
        );
        setRecords(response.data.records);
        setFilteredRecords(response.data.records);
      } catch (error) {
        setError("Failed to fetch records");
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [zoneId, API_TOKEN]);

  useEffect(() => {
    setFilteredZones(
      zones.filter((zone) =>
        zone.name.toLowerCase().includes(zoneSearch.toLowerCase())
      )
    );
  }, [zoneSearch, zones]);

  useEffect(() => {
    setFilteredRecords(
      records.filter((record) =>
        record.name.toLowerCase().includes(recordSearch.toLowerCase())
      )
    );
  }, [recordSearch, records]);

  // Function to handle record changes
  const handleRecordChange = (id, field, value) => {
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  // Function to update the record
  const updateRecord = async (record) => {
    try {
      await axios.put(
        `https://dns.hetzner.com/api/v1/records/${record.id}`,
        {
          type: record.type,
          name: record.name,
          value: record.value,
          ttl: record.ttl,
          zone_id: zoneId,
        },
        {
          headers: { "Auth-API-Token": API_TOKEN },
        }
      );
      alert("Record updated successfully!");
    } catch (error) {
      alert("Failed to update record");
    }
  };

  return (
    <>
      {/* Show "Your Zones" section only when no zone is selected */}
      {!zoneId && (
        <CRow>
          <CCol xs>
            <CCard className="mb-4">
              <CCardHeader>
                Your Zones
                <CFormInput
                  type="text"
                  placeholder="Search zones..."
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  className="mt-2"
                />
              </CCardHeader>
              <CCardBody className="zones-container">
  {loadingZones ? (
    <CSpinner color="primary" />
  ) : error ? (
    <p className="text-red-500">{error}</p>
  ) : (
    <CTable>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Zone Name</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {filteredZones.map((zone) => (
          <CTableRow key={zone.id} onClick={() => setZoneId(zone.id)}>
            <CTableDataCell>{zone.name}</CTableDataCell>
            <CTableDataCell>
              <CButton color="primary" size="sm" onClick={() => setZoneId(zone.id)}>
                Select
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )}
</CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Show "Records" section only when a zone is selected */}
      {zoneId && (
        <CRow>
          <CCol xs>
            <CCard className="mb-4">
              <CCardHeader>
                {zones.find((z) => z.id === zoneId)?.name}<br/> All Records
                <CFormInput
                  type="text"
                  placeholder="Search records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="mt-2"
                />
              </CCardHeader>
              <CCardBody className="records-container">
                {loadingRecords ? (
                  <CSpinner color="primary" />
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <CTable>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Type</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Value</CTableHeaderCell>
                        <CTableHeaderCell>TTL</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredRecords.map((record) => (
                        <CTableRow key={record.id}>
                          <CTableDataCell>{record.type}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="text"
                              value={record.name}
                              onChange={(e) => handleRecordChange(record.id, "name", e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="text"
                              value={record.value}
                              onChange={(e) => handleRecordChange(record.id, "value", e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="text"
                              value={record.ttl}
                              onChange={(e) => handleRecordChange(record.id, "ttl", e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton color="primary" size="sm" onClick={() => updateRecord(record)}>
                              Save
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  );
};

export default Charts;
