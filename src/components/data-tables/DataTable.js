'use-client'

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';

const DataTable = ({ rows, columns, id, hiddenColumns }) => {

    const [hasLoaded, setHasLoaded] = useState(false);
    const [initialState, setInitialState] = useState({
        columns: {
            columnVisibilityModel: hiddenColumns.reduce((obj, column) => {
                obj[column] = false;
                return obj;
            }, {}),
        },
        pagination: { paginationModel: { pageSize: 5 } },
    });

    useEffect(() => {
        const storedState = localStorage.getItem(`dataTable-${id}-initialState`);

        if (storedState) {
            setInitialState(JSON.parse(storedState));
        }

        setHasLoaded(true);

    }, [id]);

    useEffect(() => {

        if (hasLoaded) {
            localStorage.setItem(`dataTable${id}-initialState`, JSON.stringify(initialState));
        }
      }, [initialState]);

    
    const handlePaginationModelChange = params => {
        setInitialState(prevState => ({
            ...prevState,
            pagination: { paginationModel: { pageSize: params.pageSize } },
        }));
    };

    const handleColumnVisibilityChange = params => {
        // Update state
        setInitialState(prevState => ({
            ...prevState,
            columns: { columnVisibilityModel: params },
        }));
    };

    if (hasLoaded) {
        return (
            <DataGrid
                rows={rows}
                getRowId={(row) => row._id}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                disableRowSelectionOnClick 
                disableCellSelectionOnClick
                disableDensitySelector
                pageSizeOptions={[5, 10, 20,50,100]} // Sets options for rows per page
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                }}
                // pagination
                initialState={initialState}
                onColumnVisibilityModelChange={handleColumnVisibilityChange} // Added this handler
                onPaginationModelChange={handlePaginationModelChange}
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                       outline: "none !important",
                    },
                 }}
            />
        )
    }

    return (
        <div>
            Loading...
        </div>  
    );
};

export { DataTable };