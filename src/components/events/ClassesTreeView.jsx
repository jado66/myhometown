import React from 'react';
import { Typography, Card, Grid, Accordion, AccordionSummary, AccordionDetails, styled } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    '& .MuiTreeItem-content': {
        flexDirection: 'row-reverse',
    },
}));

export const ClassesTreeView = ({ classes }) => {
    
    if (!classes){
        return null
    }

   
    
    const renderTreeItems = (nodes) => {
        return (
            <StyledTreeItem key={nodes.id} itemId={nodes.id.toString()} label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {nodes.icon}
                    <span>{nodes.title}</span>
                </div>
            }>
                {Array.isArray(nodes.subClasses) && nodes.subClasses.length > 0 ? (
                    nodes.subClasses.map((node) => (
                        <>
                            {node.googleFormID ? (
                                <Accordion key={`accordion-${node.id}`} elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        {nodes.icon}    {node.title}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <iframe
                                            src={`https://docs.google.com/forms/d/${node.googleFormID}/viewform?embedded=true`}
                                            width="100%"
                                            height="500px"
                                            frameBorder="0"
                                            marginHeight="0"
                                            marginWidth="0"
                                        >
                                            Loading…
                                        </iframe>
                                    </AccordionDetails>
                                </Accordion>
                            ) : renderTreeItems(node)}
                        </>
                    ))
                ) : null}
            </StyledTreeItem>
        );
    }

    return (
      <>
        <Typography variant="h4" component="h2" color="primary" textAlign="center" gutterBottom>
          Community Resource Classes
        </Typography>
  
        <Card sx={{ padding: 2, marginTop: 2 }}>
          <Grid item xs={12}>
            <SimpleTreeView aria-label="classes tree view">
              {classes.map((classItem) => renderTreeItems(classItem))}
            </SimpleTreeView>
          </Grid>
        </Card>
      </>
    );
  };

