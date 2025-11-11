import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';

// Import the required hooks and types
import { useArtworksData } from './hooks/useArtworksData.ts';
import { usePersistentSelection } from './hooks/usePersistentSelection.ts'; // Make sure this file exists
import type { Artwork } from './types/artwork'; // Make sure this file exists

// Don't forget to import the CSS in your main file (e.g., main.tsx or index.css)
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
// import 'primeicons/primeicons.css'; 


// Define the rows per page (must match the limit used in useArtworksData)
const ROWS_PER_PAGE = 12;

export default function App() {
  const op = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number | null>(null);

  // --- HOOKS ---
  const { 
    data, 
    totalRecords, 
    loading, 
    error, 
    fetchData, 
    currentPage 
  } = useArtworksData();
  
  const { 
    selectedIds, 
    deselectedIds, 
    bulkSelectedCount, 
    selectionStartingPage,
    toggleRowSelection, 
    setBulkSelection 
  } = usePersistentSelection();

  // PrimeReact needs the selected objects for the current page
  const [currentSelectedRows, setCurrentSelectedRows] = useState<Artwork[]>([]);

  // --- CRITICAL PERSISTENT SELECTION LOGIC ---
  useEffect(() => {
    const selectedOnPage: Artwork[] = [];
    
    data.forEach((artwork: Artwork, index: number) => {
      let isSelected = false;

      // 1. Check for INDIVIDUAL selection/deselection overrides
      if (selectedIds.has(artwork.id)) {
        // Explicitly selected item
        isSelected = true;
      } else if (deselectedIds.has(artwork.id)) {
        // Explicitly deselected item (from a prior bulk select)
        isSelected = false;
      } 
      // 2. Check the GLOBAL BULK SELECTION RULE
      else if (bulkSelectedCount > 0) {
        // Calculate the global index of this row starting from the selection starting page
        const pageOffset = currentPage - selectionStartingPage;
        const globalRowIndex = (pageOffset * ROWS_PER_PAGE) + index;
        
        if (
          // Must be on or after the starting page
          currentPage >= selectionStartingPage && 
          // The global index must be less than the total bulk count
          globalRowIndex >= 0 && globalRowIndex < bulkSelectedCount
        ) {
          isSelected = true;
        }
      }

      if (isSelected) {
        selectedOnPage.push(artwork);
      }
    });

    setCurrentSelectedRows(selectedOnPage);
  }, [
    data, 
    selectedIds, 
    deselectedIds, 
    bulkSelectedCount, 
    selectionStartingPage, 
    currentPage
  ]); 
  
  // --- HANDLERS ---
  
  // Handles PrimeReact's pagination event
  const onPage = (event: any) => {
    // event.page is 0-indexed, API expects 1-indexed
    fetchData(event.page + 1); 
  };

  // Handles PrimeReact's row selection change event (individual row or header checkbox)
  const onSelectionChange = (e: any) => {
    const newSelection: Artwork[] = e.value;
    
    // We update the local state to satisfy PrimeReact's rendering
    setCurrentSelectedRows(newSelection);

    // Get the IDs of the previous selection on this page
    const previousSelectedIds = new Set(currentSelectedRows.map(a => a.id));
    // Get the IDs of the new selection on this page
    const newSelectedIdsOnPage = new Set(newSelection.map(a => a.id));

    data.forEach((artwork: Artwork) => {
      const id = artwork.id;
      const wasSelected = previousSelectedIds.has(id);
      const isNowSelected = newSelectedIdsOnPage.has(id);

      // Only update global state if the status changed
      if (wasSelected !== isNowSelected) {
        toggleRowSelection(id, isNowSelected);
      }
    });
  };

  // Handles the submission from the Custom Row Selection Panel
  const handleBulkSelectionSubmit = () => {
    if (selectCount === null || selectCount <= 0) {
      alert('Please enter a valid number greater than 0.');
      return;
    }

    // Call the bulk selection function in the hook
    setBulkSelection(selectCount, currentPage);
    
    // Reset and close the panel
    setSelectCount(null);
    op.current?.hide(); 
  };
  
  // Custom button for the table header to open the OverlayPanel
  const renderHeader = () => {
    let totalSelectedCount = 0;
    
    if (bulkSelectedCount > 0) {
      // Calculate total selected across all pages: bulk count minus deselected items
      totalSelectedCount = Math.max(0, bulkSelectedCount - deselectedIds.size);
    } else {
      // Only individual selections when no bulk selection is active
      totalSelectedCount = selectedIds.size;
    }
    
    const selectionSummary = `Selected: ${totalSelectedCount} rows`;

    return (
      <div className="flex justify-content-between align-items-center">
        <h4>Artworks Data ({selectionSummary})</h4>
        <Button 
          type="button" 
          label="Custom Select N Rows" 
          icon="pi pi-table" 
          onClick={(e) => op.current?.toggle(e)} 
          className="p-button-sm" 
        />
      </div>
    );
  };
  
  // --- RENDER CHECKS ---
  
  if (loading) return <div className="p-d-flex p-jc-center p-ai-center" style={{height: '100vh'}}>Loading Artworks...</div>;
  if (error) return <div className="p-error p-text-center p-mt-5">Error: {error}</div>;

  return (
    <div className="card p-5">
      <h2>Art Institute of Chicago Artworks</h2>
      
      {/* Custom Selection Overlay Panel */}
      <OverlayPanel ref={op} showCloseIcon dismissable>
        <div className="p-fluid">
          <h5>Select N Rows Globally</h5>
          <InputNumber 
            inputId="selectCount" 
            value={selectCount} 
            onValueChange={(e) => setSelectCount(e.value ?? null)} 
            mode="decimal" 
            min={1}
            placeholder="Enter N (e.g., 50)"
          />
          <Button 
            label="Apply Global Selection" 
            onClick={handleBulkSelectionSubmit} 
            className="p-mt-2" 
          />
        </div>
      </OverlayPanel>
      
      <DataTable
        value={data}
        selection={currentSelectedRows} 
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        header={renderHeader}
        // Server-Side Pagination Props
        lazy
        paginator
        first={(currentPage - 1) * ROWS_PER_PAGE} // Calculate the starting index for the current page
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        onPage={onPage}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        {/* Required Data Fields to Display */}
        <Column field="title" header="Title" sortable></Column>
        <Column field="artist_display" header="Artist" sortable></Column>
        <Column field="place_of_origin" header="Origin"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date" sortable></Column>
        <Column field="date_end" header="End Date" sortable></Column>
      </DataTable>
    </div>
  );
}