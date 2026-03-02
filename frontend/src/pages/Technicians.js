import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { User, MapPin, Wrench, Award, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { techniciansAPI } from '../services/api';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillLevels, setSkillLevels] = useState({});
  const { toast } = useToast();

  const loadTechnicians = async () => {
    try {
      const response = await techniciansAPI.getAll();
      setTechnicians(response.data || []);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load technicians',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'bg-blue-500';
      case 'available': return 'bg-green-500';
      case 'on_break': return 'bg-amber-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-red-600 text-white';
      case 'advanced': return 'bg-blue-600 text-white';
      case 'intermediate': return 'bg-amber-500 text-white';
      case 'beginner': return 'bg-gray-400 text-white';
      default: return 'bg-gray-300';
    }
  };

  const skillCategories = ['Engine Repair', 'Diagnostics', 'Preventive Maintenance', 'Electrical', 'Brake Service', 'Transmission'];

  const handleEditSkills = (tech) => {
    setSelectedTech(tech);
    setSkillLevels(tech.skillLevels);
    setEditingSkills(true);
  };

  const handleSaveSkills = async () => {
    try {
      await techniciansAPI.updateSkills(selectedTech.id, skillLevels);
      await loadTechnicians();
      toast({
        title: "Skills Updated",
        description: `Skill levels updated for ${selectedTech.name}`,
      });
      setEditingSkills(false);
      setSelectedTech(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update technician skills',
        variant: 'destructive'
      });
    }
  };

  const updateSkillLevel = (skill, level) => {
    setSkillLevels(prev => ({
      ...prev,
      [skill]: level
    }));
  };

  return (
    <div className="p-6 space-y-6" data-testid="technicians-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Technician Tracking & Skill Matrix</h1>
        <p className="text-gray-600 mt-1">Monitor technician availability and skills for optimal job assignment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {technicians.map((tech) => (
          <Card key={tech.id} className="hover:shadow-lg transition-shadow" data-testid={`technician-card-${tech.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-blue-50 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tech.name}</CardTitle>
                    <Badge className={`${getStatusColor(tech.status)} text-white mt-1`}>
                      {tech.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{tech.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{tech.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{tech.location}</span>
                </div>
                {tech.currentJob && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wrench className="h-4 w-4" />
                    <span>Working on: {tech.currentJob}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tech.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-semibold text-sm mb-2">Performance</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{tech.hoursWorked}</p>
                    <p className="text-xs text-gray-500">Hours</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">{tech.jobsCompleted}</p>
                    <p className="text-xs text-gray-500">Jobs</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-purple-600">{tech.efficiency}%</p>
                    <p className="text-xs text-gray-500">Efficiency</p>
                  </div>
                </div>
              </div>

              <Button
                data-testid={`technician-edit-skills-${tech.id}`}
                onClick={() => handleEditSkills(tech)} 
                variant="outline" 
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Skills
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Matrix - Job Assignment Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Technician</th>
                  {skillCategories.map((skill) => (
                    <th key={skill} className="text-center p-3 font-semibold text-sm">
                      {skill}
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => (
                  <tr key={tech.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{tech.name}</p>
                        <p className="text-xs text-gray-500">{tech.location}</p>
                      </div>
                    </td>
                    {skillCategories.map((skill) => (
                      <td key={skill} className="p-3 text-center">
                        {tech.skillLevels[skill] ? (
                          <Badge className={`${getSkillLevelColor(tech.skillLevels[skill])} text-xs`}>
                            {tech.skillLevels[skill]}
                          </Badge>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <Badge className={`${getStatusColor(tech.status)} text-white`}>
                        {tech.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Skill Level Legend</h4>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-red-600 text-white">Expert - Can train others</Badge>
              <Badge className="bg-blue-600 text-white">Advanced - Independent work</Badge>
              <Badge className="bg-amber-500 text-white">Intermediate - Some supervision</Badge>
              <Badge className="bg-gray-400 text-white">Beginner - Requires supervision</Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-blue-900">Auto-Assignment Recommendation</h4>
            <p className="text-sm text-blue-800">
              When creating a new work order, the system will automatically recommend the best available technician based on:
              skill level match, current availability, workload, and historical efficiency.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Skills Dialog */}
      <Dialog open={editingSkills} onOpenChange={setEditingSkills}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Skill Levels - {selectedTech?.name}</DialogTitle>
          </DialogHeader>
          {selectedTech && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Update skill levels as technicians learn and improve</p>
              {skillCategories.map((skill) => (
                <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{skill}</p>
                    <p className="text-xs text-gray-500">Current: {skillLevels[skill] || 'Not set'}</p>
                  </div>
                  <Select
                    value={skillLevels[skill] || ''}
                    onValueChange={(value) => updateSkillLevel(skill, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button data-testid="technician-cancel-skill-button" variant="outline" onClick={() => setEditingSkills(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button data-testid="technician-save-skill-button" onClick={handleSaveSkills} className="bg-gradient-to-r from-red-600 to-blue-600">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Technicians;