



function get_element_by_id(id) { 
	for (var i = elements.length - 1; i >= 0; i--) {
		if (elements[i].id == id)
			return elements[i]
	}
	return null
}

function get_elements_with_tag(frame, tag){
	let elements_with_tag = []

	for (var i = frame.childrenIds.length - 1; i >= 0; i--) {

		let child = get_element_by_id(frame.childrenIds[i])
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



async function update_common_element(frame){
	let common_elements =  get_elements_with_tag(frame,"Итоговый уровень")
	if (common_elements.length ==0)
		return
	let levels = ["Базовый","Средний","Продвинутый","Эксперт"]
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
		let level_elements =  get_elements_with_tag(frame,level)
		compleated = check_level_compleated(level_elements)
		if (compleated){
			result_level = level
		}
		else{
			break
		}
	}
	

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
				await update_common_element(frames[j])
			}
}

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Calculate Competency Level',
        svgIcon:
          '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
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

