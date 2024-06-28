import React, { useState } from 'react';
import {
  Button,
  Grid,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  styled,
  Divider
  
} from '@mui/material';import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Brush, BrushOutlined, Carpenter, LocalHospital, Plumbing, Translate } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IframeHelpDialog } from './IframeHelpDialog';

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    
    '& .MuiTreeItem-content': {
        paddingTop:'12px',
        paddingBottom:'12px',
        flexDirection: 'row-reverse',
    },
}));

export const ClassesTreeView = ({ classes, setClasses, isEdit = true }) => {
    
    const [isAddNewCategory, setAddNewCategory] = useState(false)

    const [isShowIframeHelpDialog, setShowIframeHelpDialog] = useState(false)
    const showIframeHelpDialog = () => setShowIframeHelpDialog(true)
    const hideIframeHelpDialog = () => setShowIframeHelpDialog(false)

    if (!classes){
        return null
    }


    const renderTreeItems = (category) => {
        return (
            <ClassesCategory category={category} showIframeHelpDialog = {showIframeHelpDialog}/>
        );
    }

    return (
      <>
        <IframeHelpDialog open = {isShowIframeHelpDialog} handleClose={hideIframeHelpDialog}/>
        <Typography variant="h4" component="h2" color="primary" textAlign="center" gutterBottom>
          Community Resource Classes
        </Typography>
  
        <Card sx={{ padding: 2, marginTop: 2 }}>
          <Grid item xs={12}>
            <SimpleTreeView aria-label="classes tree view" disabledItemsFocusable = {true}>
              {classes.map((classItem) => renderTreeItems(classItem))}
                {
                    isAddNewCategory && <CreateCategoryForm onClose={()=>setAddNewCategory(false)}/>
                }
                {
                    isEdit && !isAddNewCategory &&
                    <>
                        <Divider/>
                        <Button 
                            
                            startIcon={<Add />} 
                            onClick = {()=>setAddNewCategory(true)}
                            sx = {{my:1, mx:'auto'}}
                            fullWidth
                        >
                            Add New Category
                        </Button>
                    </>
                }
            </SimpleTreeView>
          </Grid>
        </Card>
      </>
    );
  };

const ClassesCategory = ({category, isEdit = true, showIframeHelpDialog}) => {

    const [isAddNewClass, setAddNewClass] = useState(false)

    return (
        <StyledTreeItem key={category.id} itemId={category.id.toString()} label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {category.icon}
                <Typography sx = {{marginLeft:'1em'}}>{category.title}</Typography>
            </div>
        }>
            {Array.isArray(category.classes) && category.classes.length > 0 ? (
                category.classes.map((classObj) => (
                   <Accordion key={`accordion-${classObj.id}`} elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            {classObj.icon}
                            <Typography sx = {{marginLeft:'1em'}}>{category.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <iframe
                                src={`https://docs.google.com/forms/d/${classObj.googleFormID}/viewform?embedded=true`}
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
                ))
            ) : null}

            {
                isAddNewClass && <CreateClassForm category={category} onClose={()=>setAddNewClass(false)} showIframeHelpDialog = {showIframeHelpDialog}/>
            }
            {
                isEdit && !isAddNewClass &&
                <>
                    <Divider/>
                    <Button 
                        
                        startIcon={<Add />} 
                        onClick = {()=>setAddNewClass(true)}
                        sx = {{my:1, mx:'auto'}}
                        fullWidth
                    >
                        Add New Class
                    </Button>
                </>
            }
        </StyledTreeItem>
    );
}


const ExampleIcons = {
    None:<div style={{height:'30px'}}>No Icon</div>,
    BrushIcon: <Brush />,
    TranslateIcon: <Translate />,
    Plumbing: <Plumbing/>,
    Carpenter: <Carpenter/>,
    LocalHospital: <LocalHospital/>


  
    // Add other icons here...
  };
  

const IconSelect = ({ icon, onSelect }) => (
  <FormControl fullWidth sx={{ my: 'auto', height:'40px !important' }} variant="outlined" size="small">
    <InputLabel id="icon-select-label">Icon</InputLabel>
    <Select
        labelId="icon-select-label"
        label="Icon"
        onChange={onSelect}
        value={icon}
     
    >
      {Object.entries(ExampleIcons).map(([name, icon]) => (
        <MenuItem key={name} value={name}>
          {icon}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const MAX_TITLE_LENGTH = 50;
const iframeRegex = /<iframe.*src="https:\/\/docs.google.com\/forms\/.*><\/iframe>/;

// // Component to create a new class within a category

const CreateCategoryForm = ({ category, onCreate, onClose }) => {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('None')

    const MAX_TITLE_LENGTH = 50;

    const isFormValid = () => {
        return title.length > 0 && title.length <= MAX_TITLE_LENGTH
    };
        
    return (
        <>
            <Divider/>
            <Grid container item xs={12} display="flex" flexDirection="row" spacing={1} sx={{ px: 2, py:2 }} alignItems="center">
                <Grid item xs={12}>
                    <Typography variant = 'h6' textAlign='center'>
                        Add New Class
                    </Typography>
                </Grid>
                <Grid container xs={12} display='flex' flexDirection='row' spacing={1} sx = {{px:2}} alignItems='center'>
                    <Grid item xs={3} sm={2}>
                        <IconSelect onSelect={(e)=>setIcon(e.target.value)} icon = {icon}/>
                    </Grid>
                    <Grid item xs={9} sm={4}>
                        
                        <TextField
                            fullWidth
                            size="small"
                            value={title}
                            label='Class Title'
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            InputProps={{
                                style: { height: "47px" },
                            }}                            
                            error={title.length > MAX_TITLE_LENGTH}
                            helperText={title.length > MAX_TITLE_LENGTH ? 'Title is too long.' : ''}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} display='flex' flexDirection='row'>
                    <Grid item xs={4} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={onClose}
                        >
                            Cancel
                        </Button>  
                    </Grid>
                    <Grid item xs={4} sm={8}/>
                    <Grid item xs={4} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                onCreate(icon, title);
                                setTitle(''); // Reset after adding
                            }}
                            disabled={!isFormValid()}
                        >
                            Add Class
                        </Button>
                    </Grid>
                </Grid>
                
            </Grid>
        </>
    );
};

const CreateClassForm = ({ category, onCreate, onClose, showIframeHelpDialog }) => {
    const [title, setTitle] = useState('');
    const [googleFormIframe, setGoogleFormIframe] = useState('');
    const [icon, setIcon] = useState('None')

    const MAX_TITLE_LENGTH = 50;
    const iframeRegex = /<iframe.*src="https:\/\/docs.google.com\/forms\/.*><\/iframe>/;

    const isFormValid = () => {
        return title.length > 0 && title.length <= MAX_TITLE_LENGTH && iframeRegex.test(googleFormIframe);
    };
        
    return (
        <>
            <Divider/>
            <Grid container item xs={12} display="flex" flexDirection="row" spacing={1} sx={{ p: 2 }} alignItems="center">
                <Grid item xs={12}>
                    <Typography variant = 'h6' textAlign='center'>
                        Add New Class 
                    </Typography>
                </Grid>
                <Grid container xs={12} display='flex' flexDirection='row' spacing={1} sx = {{px:2}} alignItems='center'>
                    <Grid item xs={3} sm={2}>
                        <IconSelect onSelect={(e)=>setIcon(e.target.value)} icon = {icon}/>
                    </Grid>
                    <Grid item xs={9} sm={3}>
                        
                        <TextField
                            fullWidth
                            size="small"
                            value={title}
                            label='Class Title'
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            InputProps={{
                                style: { height: "47px" },
                            }}                            error={title.length > MAX_TITLE_LENGTH}
                            helperText={title.length > MAX_TITLE_LENGTH ? 'Title is too long.' : ''}
                        />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                        <TextField
                            fullWidth
                            size="small"
                            value={googleFormIframe}
                            onChange={(e) => setGoogleFormIframe(e.target.value)}
                            placeholder="Google Form iframe code"
                            margin="normal"
                            InputProps={{
                                style: { height: "47px" },
                                endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton onClick={showIframeHelpDialog}>
                                        <HelpOutlineIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                
                            }}
                            error={!iframeRegex.test(googleFormIframe) && googleFormIframe}
                            helperText={!iframeRegex.test(googleFormIframe) && googleFormIframe ? 'Invalid iframe code.' : ''}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} display='flex' flexDirection='row'>
                    <Grid item xs={4} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={onClose}
                        >
                            Cancel
                        </Button>  
                    </Grid>
                    <Grid item xs={4} sm={8}/>
                    <Grid item xs={4} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                onCreate(title, googleFormIframe);
                                setTitle(''); // Reset after adding
                                setGoogleFormIframe(''); // Reset after adding
                            }}
                            disabled={!isFormValid()}
                        >
                            Add Class
                        </Button>
                    </Grid>
                </Grid>
                
            </Grid>
        </>
    );
};


