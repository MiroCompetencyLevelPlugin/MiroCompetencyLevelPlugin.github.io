function get_element_by_id(elements,id) { 
	for (var i = elements.length - 1; i >= 0; i--) {
		if (elements[i].id == id)
			return elements[i]
	}
	return null
}

function get_elements_with_tag(elements,frame, tag){
	let elements_with_tag = []

	for (var i = frame.childrenIds.length - 1; i >= 0; i--) {

		let child = get_element_by_id(elements,frame.childrenIds[i])
		let tags = child.tags
		if (tags == null)
			continue
		for (var j = tags.length - 1; j >= 0; j--) {
			if (tags[j].title == tag)
				elements_with_tag.push(child)
				continue
		}

	}

	return elements_with_tag

}


function check_level_compleated(level_elements){

	let uncompleated_elements_count = 0

	for (var j = level_elements.length - 1; j >= 0; j--) {
			level_element = level_elements[j]
			let color = level_element.style.stickerBackgroundColor
			if (color =="#93d275")
				continue
			uncompleated_elements_count++
		}

	return uncompleated_elements_count == 0
}



async function update_common_element(elements,frame){
	let common_elements =  get_elements_with_tag(elements,frame,"Итоговый уровень")

	const regex = /:: /g
	const stub_suffix = "competency_stub"
	const stub_regex = /competency_stub/g
	const found_competency_title = frame.title.match(regex) != null;
	if (common_elements.length ==0 && !found_competency_title)
		return
	let levels = ["Новичок","Базовый","Средний","Продвинутый","Эксперт"]
	let level_to_colors = {
	"Новичок":"#ffffff",
	"Базовый":"#f24726",
	"Средний":"#fac710",
	"Продвинутый":"#8fd14f",
	"Эксперт":"#12cdd4"

	}
	let result_level = "Новичок"
	for (var i = 0; i< levels.length; i++){
		level = levels[i]
		let level_elements =  get_elements_with_tag(elements,frame,level)
		compleated = check_level_compleated(level_elements)
		if (compleated){
			result_level = level
		}
		else{
			break
		}
	}
	frame.style.backgroundColor = level_to_colors[result_level]
	if (found_competency_title){
		var title= frame.title
		for (var i = 0; i< levels.length; i++){
			level = levels[i]
		
			title = title.replace(` :: ${level}`, stub_suffix)
		}
		
		if (title.match(stub_suffix) == null){
			title = title + ` :: ${result_level}`
		}else{
			title = title.replace (stub_suffix, ` :: ${result_level}`)
		}
		frame.title = title
	}
	await miro.board.widgets.update(frame) 

	for (var j = common_elements.length - 1; j >= 0; j--) {
			common_element = common_elements[j]

			common_element.text = `${result_level}`
			common_element.style.stickerBackgroundColor = level_to_colors[result_level]
			await miro.board.widgets.update(common_element) 
		}

}

async function update_common_element_for_all_frames(){
	let elements = await miro.board.widgets.get()

	let frames = elements.filter(element => element.type == "FRAME")

	for (var j = frames.length - 1; j >= 0; j--) {
				await update_common_element(elements,frames[j])
			}
}

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Рассчитать уровень компетенций',
        svgIcon:
          '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><circle cx="12" cy="6" r="2"/><path d="M21,16v-2c-2.24,0-4.16-0.96-5.6-2.68l-1.34-1.6C13.68,9.26,13.12,9,12.53,9h-1.05c-0.59,0-1.15,0.26-1.53,0.72l-1.34,1.6 C7.16,13.04,5.24,14,3,14v2c2.77,0,5.19-1.17,7-3.25V15l-3.88,1.55C5.45,16.82,5,17.48,5,18.21C5,19.2,5.8,20,6.79,20H9v-0.5 c0-1.38,1.12-2.5,2.5-2.5h3c0.28,0,0.5,0.22,0.5,0.5S14.78,18,14.5,18h-3c-0.83,0-1.5,0.67-1.5,1.5V20h7.21 C18.2,20,19,19.2,19,18.21c0-0.73-0.45-1.39-1.12-1.66L14,15v-2.25C15.81,14.83,18.23,16,21,16z"/></g></g></svg>',
        positionPriority: 1,
        onClick: async () => {
          await update_common_element_for_all_frames()

          // Show success message
          miro.showNotification('Уровни компетенций обновлены')
        },
      },
    },
  })
})