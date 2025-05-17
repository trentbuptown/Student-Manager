import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Switch,
    FormControlLabel,
    Paper,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';

const Settings = () => {
    const [settings, setSettings] = useState({
        darkMode: false,
        notifications: true,
        language: 'vi',
        fontSize: 'medium'
    });

    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Cài đặt hệ thống
            </Typography>
            
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Giao diện
                </Typography>
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.darkMode}
                            onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                        />
                    }
                    label="Chế độ tối"
                />
                
                <Box mt={2}>
                    <FormControl fullWidth>
                        <InputLabel>Cỡ chữ</InputLabel>
                        <Select
                            value={settings.fontSize}
                            label="Cỡ chữ"
                            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                        >
                            <MenuItem value="small">Nhỏ</MenuItem>
                            <MenuItem value="medium">Vừa</MenuItem>
                            <MenuItem value="large">Lớn</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Thông báo
                </Typography>
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.notifications}
                            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        />
                    }
                    label="Bật thông báo"
                />
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Ngôn ngữ
                </Typography>
                
                <FormControl fullWidth>
                    <InputLabel>Ngôn ngữ</InputLabel>
                    <Select
                        value={settings.language}
                        label="Ngôn ngữ"
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                        <MenuItem value="vi">Tiếng Việt</MenuItem>
                        <MenuItem value="en">Tiếng Anh</MenuItem>
                    </Select>
                </FormControl>
            </Paper>
        </Container>
    );
};

export default Settings; 