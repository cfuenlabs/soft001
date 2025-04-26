window.cflabs.utils = {};

const getCFLSTAMP = (project, type) =>
	`CFL_STAMP_${project}_${type}-${Math.floor(Date.now())}`;

window.cflabs.utils.getCFLSTAMP = getCFLSTAMP;
