L.DistortHandle = L.EditHandle.extend({
	options: {
		TYPE: 'distort',
		icon: new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGDSURBVFhHxZeBcYMwDEVp50j3aAbJIFmkg7R7NN0j2aPV4yLuV9hgE5v8u59wPpDk749lXoY6nIxH47vxzXgwOi7Gm/HrzmYgyafxt5I8owVuwocxFbyGxKgGlV+NMRhjZyPLEGfH8sCUWt/GYjUIHpPXypkrhNiLIEl8iGBbgVoai4ktTgSp9ObVigsQFeU6iWi4FskdxNLYM2NG6ZGuNVhKzfFvKdQwXPdCNo8PwkdMt4ao9AiVpufsHWrI0ys/RkfTPTwDNeCRAhbfyw74uf8DmtokB9wD6oMr7VgT17bnrZhysgRPBQVwiHDs7YexAN2bOeX0hr51FwqYuXJHjOrrRpTtVA2h2/Gkhg/Anj7QycIJ2SbRGNk8sUmoUVohno5mSj/1QOLQTgVbFBGTc+zLAlliEY+cjqLp4KrJY8UQw9T4giRqOMjEihUlgJ6QnV5ILIb7CY5aUUHI2OrMU4jG3MKs4UqRkrOEPLM66y2f59Ald7CnIzN9hc/0wqPdMPwBdf7pAA7sppsAAAAASUVORK5CYII=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},

	updateHandle: function() {
		this.setLatLng(this._handled._corners[this._corner]);
	},

	_onHandleDrag: function() {
		this._handled._updateCorner(this._corner, this.getLatLng());

		this._handled.fire('update');
	}
});
